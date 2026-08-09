import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  ColorDefaultIcon,
  GeoPoint,
  MapCameraPosition,
  createGeoRectBounds,
  createMarkerState,
  type GeoRectBounds,
} from '@mapconductor/js-sdk-core';
import { Markers, Polyline } from '@mapconductor/js-sdk-react/native';

import { MapViewContainer } from '../../MapViewContainer';
import { useMapStateRef } from '../../../providers/useMapStateRef';
import type { MapProvider } from '../../../providers/types';

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 20, longitude: 60, altitude: 0 }),
  zoom: 2,
  bearing: 0,
  tilt: 0,
});

const CITIES = [
  { id: 'tokyo', label: 'Tokyo', short: 'T', latitude: 35.6762, longitude: 139.6503, color: '#e6194B' },
  { id: 'osaka', label: 'Osaka', short: 'O', latitude: 34.6937, longitude: 135.5023, color: '#f58231' },
  { id: 'honolulu', label: 'Honolulu', short: 'H', latitude: 21.3099, longitude: -157.8581, color: '#3cb44b' },
  { id: 'new-york', label: 'New York', short: 'N', latitude: 40.7128, longitude: -74.006, color: '#4363d8' },
  { id: 'london', label: 'London', short: 'L', latitude: 51.5074, longitude: -0.1278, color: '#911eb4' },
  { id: 'sydney', label: 'Sydney', short: 'S', latitude: -33.8688, longitude: 151.2093, color: '#f032e6' },
] as const;

type CityId = (typeof CITIES)[number]['id'];

const PRESETS: { id: string; label: string; cities: CityId[] }[] = [
  { id: 'world', label: '世界（全都市）', cities: ['tokyo', 'osaka', 'honolulu', 'new-york', 'london', 'sydney'] },
  { id: 'pacific', label: '太平洋', cities: ['tokyo', 'honolulu', 'sydney'] },
  { id: 'atlantic', label: '大西洋', cities: ['new-york', 'london'] },
  { id: 'japan', label: '日本', cities: ['tokyo', 'osaka'] },
];

const PADDINGS = [0, 40, 80, 160];

function boundsForPreset(cityIds: readonly CityId[]): GeoRectBounds {
  const bounds = createGeoRectBounds({});
  for (const id of cityIds) {
    const city = CITIES.find((candidate) => candidate.id === id)!;
    bounds.extend(GeoPoint.from({ latitude: city.latitude, longitude: city.longitude, altitude: 0 }));
  }
  return bounds;
}

export function FitBoundsPage({ provider }: { provider: MapProvider }) {
  const { stateRef, onStateReady } = useMapStateRef();
  const [padding, setPadding] = useState(80);
  const [presetId, setPresetId] = useState('world');

  const markers = useMemo(
    () =>
      CITIES.map((city) =>
        createMarkerState({
          id: city.id,
          position: GeoPoint.from({
            latitude: city.latitude,
            longitude: city.longitude,
            altitude: 0,
          }),
          extra: city.label,
          icon: new ColorDefaultIcon({
            fillColor: city.color,
            label: city.short,
            labelTextColor: '#ffffff',
          }),
        })
      ),
    []
  );

  // 目標範囲を塗りつぶさない矩形として可視化する（web 版と同じ）。
  const targetBounds = useMemo(() => {
    const preset = PRESETS.find((candidate) => candidate.id === presetId);
    return preset ? boundsForPreset(preset.cities) : null;
  }, [presetId]);

  const fit = (id: string, pad: number) => {
    const preset = PRESETS.find((candidate) => candidate.id === id);
    if (!preset) return;
    stateRef.current?.fitBounds(boundsForPreset(preset.cities), pad);
  };

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer
        provider={provider}
        cameraPosition={INIT_CAMERA}
        mapId="fit-bounds"
        style={styles.map}
        onStateReady={onStateReady}
      >
        <Markers states={markers} />
        {targetBounds ? (
          <Polyline bounds={targetBounds} strokeColor="#1d4ed8" strokeWidth={2} geodesic={false} />
        ) : null}
      </MapViewContainer>

      <View style={styles.controlPanel}>
        <Text style={styles.title}>Fit Bounds</Text>

        <Text style={styles.sectionLabel}>範囲</Text>
        <View style={styles.buttonGrid}>
          {PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.id}
              style={[styles.button, presetId === preset.id && styles.buttonActive]}
              activeOpacity={0.75}
              onPress={() => {
                setPresetId(preset.id);
                fit(preset.id, padding);
              }}
            >
              <Text
                style={[styles.buttonText, presetId === preset.id && styles.buttonTextActive]}
                numberOfLines={1}
              >
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>パディング (px)</Text>
        <View style={styles.buttonGrid}>
          {PADDINGS.map((pad) => (
            <TouchableOpacity
              key={pad}
              style={[styles.paddingButton, padding === pad && styles.buttonActive]}
              activeOpacity={0.75}
              onPress={() => {
                setPadding(pad);
                fit(presetId, pad);
              }}
            >
              <Text style={[styles.buttonText, padding === pad && styles.buttonTextActive]}>
                {pad}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.note}>
          ヒント: 先に地図を回転・傾けてからフィットすると、現在の bearing/tilt を保ったまま収まります。
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: { flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' },
  map: { flex: 1 },
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
  title: { marginBottom: 10, color: '#111827', fontSize: 16, fontWeight: '700' },
  sectionLabel: { marginBottom: 6, color: '#6b7280', fontSize: 12 },
  buttonGrid: { marginBottom: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paddingButton: {
    width: 56,
    minHeight: 34,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  buttonText: { color: '#1f2937', fontSize: 13, fontWeight: '600' },
  buttonTextActive: { color: '#1d4ed8' },
  note: { color: '#475569', fontSize: 12, lineHeight: 17 },
});
