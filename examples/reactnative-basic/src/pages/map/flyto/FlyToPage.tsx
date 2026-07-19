import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  GeoPoint,
  MapCameraPosition,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
} from '@mapconductor/js-sdk-core';
import {
  GoogleMapDesign,
  useGoogleMapViewState,
} from '@mapconductor/reactnative-for-googlemaps';
import {
  MapLibreDesign,
  useMapLibreViewState,
} from '@mapconductor/reactnative-for-maplibre';
import { MapViewContainer } from '../../MapViewContainer';

type MapProvider = 'maplibre' | 'google-maps';

interface CityLocation {
  id: string;
  label: string;
  position: GeoPoint;
}

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 35.0, longitude: 0.0, altitude: 0 }),
  zoom: 3,
  bearing: 0,
  tilt: 0,
});

const FLY_TO_DURATION_MS = 1600;

function createCityLocations(): CityLocation[] {
  return [
    {
      id: 'tokyo',
      label: 'Tokyo',
      position: GeoPoint.from({ latitude: 35.6812, longitude: 139.7671, altitude: 0 }),
    },
    {
      id: 'sapporo',
      label: 'Sapporo',
      position: GeoPoint.from({ latitude: 43.0642, longitude: 141.3469, altitude: 0 }),
    },
    {
      id: 'honolulu',
      label: 'Honolulu',
      position: GeoPoint.from({ latitude: 21.3069, longitude: -157.8583, altitude: 0 }),
    },
    {
      id: 'new-york',
      label: 'NY',
      position: GeoPoint.from({ latitude: 40.7128, longitude: -74.006, altitude: 0 }),
    },
  ];
}

function FlyToMap({
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

function flyToCity(
  city: CityLocation,
  mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>>
) {
  mapViewState.moveCameraTo(
    MapCameraPosition.from({
      position: city.position,
      zoom: 13,
      bearing: 0,
      tilt: 0,
    }),
    FLY_TO_DURATION_MS
  );
}

export function FlyToPage({ provider }: { provider: MapProvider }) {
  const cities = useMemo(createCityLocations, []);

  const mapLibreState = useMapLibreViewState({
    id: 'fly-to-maplibre',
    mapDesignType: MapLibreDesign.DemoTiles,
    cameraPosition: INIT_CAMERA,
  });
  const googleState = useGoogleMapViewState({
    id: 'fly-to-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA,
  });

  const currentState = (
    provider === 'google-maps' ? googleState : mapLibreState
  ) as MapViewStateInterface<MapDesignTypeInterface<unknown>>;

  return (
    <View style={styles.mapContainer}>
      <FlyToMap provider={provider} mapLibreState={mapLibreState} googleState={googleState} />

      <View style={styles.controlPanel}>
        <Text style={styles.controlPanelTitle}>Fly To</Text>
        <View style={styles.buttonGrid}>
          {cities.map((city) => (
            <TouchableOpacity
              key={city.id}
              style={styles.cityButton}
              activeOpacity={0.75}
              onPress={() => flyToCity(city, currentState)}
            >
              <Text style={styles.cityButtonText} numberOfLines={1}>
                {city.label}
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
    maxWidth: 340,
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
  cityButton: {
    width: '48%',
    minHeight: 32,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  cityButtonText: {
    color: '#1f2937',
    fontSize: 14,
  },
  drawerRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerScrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  drawer: {
    width: 300,
    maxWidth: '82%',
    backgroundColor: '#ffffff',
  },
});
