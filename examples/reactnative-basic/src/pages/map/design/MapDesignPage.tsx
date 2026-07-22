import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

import {
  GeoPoint,
  MapCameraPosition,
  type MapDesignTypeInterface,
} from '@mapconductor/js-sdk-core';
import {
  GoogleMapDesign,
  useGoogleMapViewState,
  type GoogleMapDesignType,
} from '@mapconductor/reactnative-for-googlemaps';
import {
  MapLibreDesign,
  useMapLibreViewState,
  type MapLibreMapDesignType,
} from '@mapconductor/reactnative-for-maplibre';
import { MapViewContainer } from '../../MapViewContainer';

export type MapProvider = 'maplibre' | 'google-maps' | 'here';

interface MapDesignOption {
  label: string;
  design: MapDesignTypeInterface<unknown>;
}

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 21.382314, longitude: -157.933097, altitude: 0 }),
  zoom: 12,
  bearing: 0,
  tilt: 0,
});

const GOOGLE_MAP_2D_DESIGNS: MapDesignOption[] = [
  { label: 'Normal', design: GoogleMapDesign.Normal },
  { label: 'Satellite', design: GoogleMapDesign.Satellite },
  { label: 'Hybrid', design: GoogleMapDesign.Hybrid },
  { label: 'Terrain', design: GoogleMapDesign.Terrain },
  { label: 'None', design: GoogleMapDesign.None },
];

const MAPLIBRE_DESIGNS: MapDesignOption[] = [
  { label: 'DemoTiles', design: MapLibreDesign.DemoTiles },
  { label: 'MapTilerBasicEn', design: MapLibreDesign.MapTilerBasicEn },
  { label: 'MapTilerBasicJa', design: MapLibreDesign.MapTilerBasicJa },
  { label: 'MapTilerTonerEn', design: MapLibreDesign.MapTilerTonerEn },
  { label: 'MapTilerTonerJa', design: MapLibreDesign.MapTilerTonerJa },
  { label: 'OsmBright', design: MapLibreDesign.OsmBright },
  { label: 'OsmBrightEn', design: MapLibreDesign.OsmBrightEn },
  { label: 'OsmBrightJa', design: MapLibreDesign.OsmBrightJa },
  { label: 'OpenMapTiles', design: MapLibreDesign.OpenMapTiles },
];

function providerLabel(provider: MapProvider): string {
  return provider === 'google-maps' ? 'Google Maps' : 'MapLibre';
}

function providerDesignOptions(provider: MapProvider): MapDesignOption[] {
  return provider === 'google-maps' ? GOOGLE_MAP_2D_DESIGNS : MAPLIBRE_DESIGNS;
}

function DesignMap({
  provider,
  mapLibreState,
  googleState,
}: {
  provider: MapProvider;
  mapLibreState: ReturnType<typeof useMapLibreViewState>;
  googleState: ReturnType<typeof useGoogleMapViewState>;
}) {
  const state = provider === 'google-maps' ? googleState : mapLibreState;
  return <MapViewContainer state={state} style={styles.map} />;
}

export function MapDesignPage({ provider }: { provider: MapProvider }) {
  const mapLibreState = useMapLibreViewState({
    id: 'map-design-maplibre',
    mapDesignType: MapLibreDesign.DemoTiles,
    cameraPosition: INIT_CAMERA,
  });
  const googleState = useGoogleMapViewState({
    id: 'map-design-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA,
  });

  const mapDesignOptions = useMemo(() => providerDesignOptions(provider), [provider]);
  const currentState = provider === 'google-maps' ? googleState : mapLibreState;
  const [selectedDesignId, setSelectedDesignId] = useState(String(mapLibreState.mapDesignType.id));

  useEffect(() => {
    setSelectedDesignId(String(currentState.mapDesignType.id));
  }, [currentState, provider]);

  function handleDesignChange(designId: string) {
    const option = mapDesignOptions.find((item) => String(item.design.id) === designId);
    if (!option) return;

    if (provider === 'google-maps') {
      googleState.mapDesignType = option.design as GoogleMapDesignType;
    } else {
      mapLibreState.mapDesignType = option.design as MapLibreMapDesignType;
    }
    setSelectedDesignId(String(option.design.id));
  }

  return (
    <View style={styles.mapContainer}>
      <DesignMap provider={provider} mapLibreState={mapLibreState} googleState={googleState} />

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
