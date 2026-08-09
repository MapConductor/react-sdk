import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { GeoPoint, MapCameraPosition } from '@mapconductor/js-sdk-core';
import { MapViewContainer } from '../../MapViewContainer';
import { useMapStateRef } from '../../../providers/useMapStateRef';
import { DESIGN_OPTIONS, providerLabel } from '../../../providers/designOptions';
import type { MapProvider } from '../../../providers/types';

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 21.382314, longitude: -157.933097, altitude: 0 }),
  zoom: 12,
  bearing: 0,
  tilt: 0,
});

export function MapDesignPage({ provider }: { provider: MapProvider }) {
  const { stateRef, onStateReady } = useMapStateRef();
  const mapDesignOptions = useMemo(() => DESIGN_OPTIONS[provider] ?? [], [provider]);
  const [selectedDesignId, setSelectedDesignId] = useState(
    () => String(mapDesignOptions[0]?.design.id ?? '')
  );

  // プロバイダを切り替えると MapViewContainer がビューを作り直し、
  // 新しい state を onStateReady で返す。ピッカーの選択値もそれに合わせる。
  useEffect(() => {
    setSelectedDesignId(String(stateRef.current?.mapDesignType.id ?? mapDesignOptions[0]?.design.id ?? ''));
  }, [provider, mapDesignOptions, stateRef]);

  function handleDesignChange(designId: string) {
    const option = mapDesignOptions.find((item) => String(item.design.id) === designId);
    const mapViewState = stateRef.current;
    if (!option || !mapViewState) return;

    mapViewState.mapDesignType = option.design;
    setSelectedDesignId(String(option.design.id));
  }

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer
        provider={provider}
        cameraPosition={INIT_CAMERA}
        mapId="map-design"
        style={styles.map}
        onStateReady={onStateReady}
      />

      <View style={styles.mapDesignSelector}>
        <Text style={styles.mapDesignLabel}>Map design</Text>
        <Picker<string>
          selectedValue={selectedDesignId}
          onValueChange={handleDesignChange}
          style={styles.designPicker}
          dropdownIconColor="#111827"
          mode="dropdown"
        >
          {mapDesignOptions.map((option) => (
            <Picker.Item
              key={String(option.design.id)}
              label={option.label}
              value={String(option.design.id)}
            />
          ))}
        </Picker>
        <Text style={styles.providerCaption}>{providerLabel(provider)}</Text>
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
  mapDesignSelector: {
    position: 'absolute',
    left: 16,
    bottom: 20,
    width: 320,
    maxWidth: '92%',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.7)',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#0f172a',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  mapDesignLabel: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  designPicker: {
    height: 50,
    marginHorizontal: -8,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  providerCaption: {
    color: '#64748b',
    fontSize: 11,
  },
});
