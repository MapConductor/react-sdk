import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import {
  GeoPoint,
  MapCameraPosition,
  MapUISettings,
} from '@mapconductor/js-sdk-core';

import { MapViewContainer } from '../../MapViewContainer';
import { useMapStateRef } from '../../../providers/useMapStateRef';
import type { MapProvider } from '../../../providers/types';

/**
 * web の `examples/basic/src/pages/map/uisettings/UISettingsPage.tsx` と同じ内容。
 * `state.uiSettings` へ代入するとビューが購読して地図エンジンへ流す（RN は
 * ネイティブの applyUISettings コマンドへブリッジされる）。
 */
const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 35.681236, longitude: 139.767125, altitude: 0 }),
  zoom: 14,
  bearing: 0,
  tilt: 0,
});

type GestureKey = keyof MapUISettings;

const GESTURES: { key: GestureKey; label: string }[] = [
  { key: 'scrollGesture', label: 'Pan' },
  { key: 'zoomGesture', label: 'Zoom' },
  { key: 'rotateGesture', label: 'Rotate' },
  { key: 'tiltGesture', label: 'Tilt' },
];

export function UISettingsPage({ provider }: { provider: MapProvider }) {
  const [settings, setSettings] = useState<MapUISettings>({ ...MapUISettings.Default });
  const { stateRef, onStateReady } = useMapStateRef();

  const update = (key: GestureKey, enabled: boolean) => {
    const next = { ...settings, [key]: enabled };
    setSettings(next);
    const mapViewState = stateRef.current;
    if (mapViewState) mapViewState.uiSettings = next;
  };

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer
        provider={provider}
        cameraPosition={INIT_CAMERA}
        mapId="ui-settings"
        style={styles.map}
        onStateReady={onStateReady}
      />

      <View style={styles.controlPanel}>
        <Text style={styles.controlPanelTitle}>Gestures</Text>
        {GESTURES.map(({ key, label }) => (
          <View key={key} style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Switch value={settings[key]} onValueChange={(value) => update(key, value)} />
          </View>
        ))}
        <Text style={styles.note}>
          フラグを反映できないプロバイダは、ログに一度だけ警告を出します。
        </Text>
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
    bottom: 20,
    width: 300,
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
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  rowLabel: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
  },
  note: {
    marginTop: 8,
    color: '#6b7280',
    fontSize: 12,
  },
});
