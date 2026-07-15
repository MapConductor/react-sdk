import React, { useCallback, useState } from 'react';
import Slider from '@react-native-community/slider';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { GeoPoint, MapCameraPosition, type PolygonEvent } from '@mapconductor/js-sdk-core';
import { Polygon } from '@mapconductor/js-sdk-react/native';
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

const OUTER_RING = [
  GeoPoint.from({ latitude: 35.72, longitude: 139.69 }),
  GeoPoint.from({ latitude: 35.73, longitude: 139.82 }),
  GeoPoint.from({ latitude: 35.64, longitude: 139.84 }),
  GeoPoint.from({ latitude: 35.63, longitude: 139.7 }),
];

const INNER_HOLE = [
  GeoPoint.from({ latitude: 35.695, longitude: 139.745 }),
  GeoPoint.from({ latitude: 35.7, longitude: 139.785 }),
  GeoPoint.from({ latitude: 35.665, longitude: 139.79 }),
  GeoPoint.from({ latitude: 35.66, longitude: 139.75 }),
];
const POLYGON_HOLES = [INNER_HOLE];

export function PolygonPage({ provider }: { provider: MapProvider }) {
  const [fillOpacity, setFillOpacity] = useState(0.45);
  const [geodesic, setGeodesic] = useState(false);
  const [clickedText, setClickedText] = useState('Tap the filled area');
  const mapLibreState = useMapLibreViewState({
    id: 'polygon-maplibre',
    mapDesignType: MapLibreDesign.DemoTiles,
    cameraPosition: INIT_CAMERA,
  });
  const googleState = useGoogleMapViewState({
    id: 'polygon-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA,
  });

  const onPolygonClick = useCallback((event: PolygonEvent) => {
    setClickedText(
      `${event.clicked.latitude.toFixed(5)}, ${event.clicked.longitude.toFixed(5)}`
    );
  }, []);

  const polygon = (
    <Polygon
      id="tokyo-polygon"
      points={OUTER_RING}
      holes={POLYGON_HOLES}
      strokeColor="#1d4ed8"
      strokeWidth={4}
      fillColor={`rgba(37, 99, 235, ${fillOpacity})`}
      geodesic={geodesic}
      zIndex={10}
      onClick={onPolygonClick}
    />
  );
  const state = provider === 'google-maps' ? googleState : mapLibreState;

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer state={state} style={styles.map}>
        {polygon}
      </MapViewContainer>

      <View style={styles.controlPanel}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Polygon with hole</Text>
          <Text style={styles.value}>{fillOpacity.toFixed(2)}</Text>
        </View>
        <Text style={styles.label}>Fill opacity</Text>
        <Slider
          style={styles.slider}
          minimumValue={0.1}
          maximumValue={0.9}
          value={fillOpacity}
          minimumTrackTintColor="#2563eb"
          maximumTrackTintColor="#cbd5e1"
          thumbTintColor="#2563eb"
          onValueChange={setFillOpacity}
        />
        <View style={styles.switchRow}>
          <Text style={styles.label}>Geodesic</Text>
          <Switch value={geodesic} onValueChange={setGeodesic} />
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
