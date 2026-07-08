import React, { useState } from 'react';
import { Platform, StatusBar, StyleSheet, View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import {
  GoogleMapsView,
  GoogleMapDesign,
  useGoogleMapViewState,
} from '@mapconductor/reactnative-for-googlemaps';
import {
  MapLibreView,
  MapLibreDesign,
  useMapLibreViewState,
} from '@mapconductor/reactnative-for-maplibre';
import { GeoPoint, MapCameraPosition } from '@mapconductor/js-sdk-core';

type Provider = 'google' | 'maplibre';

const INITIAL_CAMERA = MapCameraPosition.from({
  position: GeoPoint.fromLatLng(35.6812, 139.7671),
  zoom: 12,
  bearing: 0,
  tilt: 0,
});

export function MapScreen() {
  const [provider, setProvider] = useState<Provider>('google');
  const [statusText, setStatusText] = useState('');

  const googleState = useGoogleMapViewState({
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INITIAL_CAMERA,
  });

  const maplibreState = useMapLibreViewState({
    mapDesignType: MapLibreDesign.OsmBright,
    cameraPosition: INITIAL_CAMERA,
  });

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.label}>Provider</Text>
        <Picker<Provider>
          selectedValue={provider}
          onValueChange={(value) => setProvider(value)}
          style={styles.picker}
          dropdownIconColor="#333"
        >
          <Picker.Item label="Google Maps" value="google" />
          <Picker.Item label="MapLibre" value="maplibre" />
        </Picker>
      </View>

      {statusText !== '' && (
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      )}

      <View style={styles.mapContainer}>
        {provider === 'google' ? (
          <GoogleMapsView
            state={googleState}
            apiKey=""
            style={styles.map}
            onMapLoaded={() => setStatusText('Google Maps loaded')}
            onMapClick={(point) =>
              setStatusText(`Clicked: ${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}`)
            }
          />
        ) : (
          <MapLibreView
            state={maplibreState}
            style={styles.map}
            onMapLoaded={() => setStatusText('MapLibre loaded')}
            onMapClick={(point) =>
              setStatusText(`Clicked: ${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}`)
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  picker: {
    flex: 1,
    height: 44,
  },
  statusBar: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#e8f4f8',
  },
  statusText: {
    fontSize: 12,
    color: '#555',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
