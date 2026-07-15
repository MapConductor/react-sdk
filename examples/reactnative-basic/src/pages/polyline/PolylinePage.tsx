import React, { useState } from 'react';
import Slider from '@react-native-community/slider';
import { StyleSheet, Switch, Text, View } from 'react-native';

import {
  GeoPoint,
  MapCameraPosition,
  createPolylineState,
  type PolylineEvent,
} from '@mapconductor/js-sdk-core';
import { Polyline } from '@mapconductor/js-sdk-react/native';
import {
  GoogleMapDesign,
  useGoogleMapViewState,
} from '@mapconductor/react-for-googlemaps';
import {
  MapLibreDesign,
  useMapLibreViewState,
} from '@mapconductor/react-for-maplibre';

import type { MapProvider } from '../../screens/MapScreen';
import { MapViewContainer } from '../MapViewContainer';

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 35.6812, longitude: 139.7671, altitude: 0 }),
  zoom: 11,
  bearing: 0,
  tilt: 0,
});

const ROUTE_POINTS = [
  GeoPoint.from({ latitude: 35.7101, longitude: 139.8107 }),
  GeoPoint.from({ latitude: 35.6812, longitude: 139.7671 }),
  GeoPoint.from({ latitude: 35.658, longitude: 139.7016 }),
  GeoPoint.from({ latitude: 35.6764, longitude: 139.65 }),
];

export function PolylinePage({ provider }: { provider: MapProvider }) {
  const [strokeWidth, setStrokeWidth] = useState(8);
  const [geodesic, setGeodesic] = useState(false);
  const [clickedText, setClickedText] = useState('Tap the route');
  const mapLibreState = useMapLibreViewState({
    id: 'polyline-maplibre',
    mapDesignType: MapLibreDesign.DemoTiles,
    cameraPosition: INIT_CAMERA,
  });
  const googleState = useGoogleMapViewState({
    id: 'polyline-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA,
  });

  const [polylineState] = useState(
    () =>
      createPolylineState({
        id: 'tokyo-route',
        points: ROUTE_POINTS,
        strokeColor: 'rgba(220, 38, 38, 0.85)',
        strokeWidth: 8,
        geodesic: false,
        zIndex: 10,
        onClick: (event: PolylineEvent) => {
          setClickedText(
            `${event.clicked.latitude.toFixed(5)}, ${event.clicked.longitude.toFixed(5)}`
          );
        },
      })
  );
  const state = provider === 'google-maps' ? googleState : mapLibreState;

  const handleStrokeWidthChange = (value: number) => {
    polylineState.strokeWidth = value;
    setStrokeWidth(value);
  };

  const handleGeodesicChange = (value: boolean) => {
    polylineState.geodesic = value;
    setGeodesic(value);
  };

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer state={state} style={styles.map}>
        <Polyline state={polylineState} />
      </MapViewContainer>

      <View style={styles.controlPanel}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Polyline</Text>
          <Text style={styles.value}>{strokeWidth.toFixed(0)} dp</Text>
        </View>
        <Text style={styles.label}>Stroke width</Text>
        <Slider
          style={styles.slider}
          minimumValue={2}
          maximumValue={20}
          step={1}
          value={strokeWidth}
          minimumTrackTintColor="#dc2626"
          maximumTrackTintColor="#cbd5e1"
          thumbTintColor="#dc2626"
          onValueChange={handleStrokeWidthChange}
        />
        <View style={styles.switchRow}>
          <Text style={styles.label}>Geodesic</Text>
          <Switch value={geodesic} onValueChange={handleGeodesicChange} />
        </View>
        <Text style={styles.clicked}>Clicked: {clickedText}</Text>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  value: {
    color: '#475569',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  label: {
    color: '#475569',
    fontSize: 13,
  },
  slider: {
    width: '100%',
    height: 38,
  },
  switchRow: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clicked: {
    marginTop: 8,
    color: '#334155',
    fontSize: 12,
  },
});
