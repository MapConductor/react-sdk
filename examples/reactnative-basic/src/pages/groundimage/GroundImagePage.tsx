import React, { useCallback, useRef, useState } from 'react';
import Slider from '@react-native-community/slider';
import { Platform, StyleSheet, Text, ToastAndroid, View } from 'react-native';

import {
  ColorDefaultIcon,
  createGeoPoint,
  createGeoRectBounds,
  createGroundImageState,
  createMapCameraPosition,
  createMarkerState,
  type GroundImageState,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { GroundImage, Marker } from '@mapconductor/js-sdk-react/native';
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

const ANDROID_PACKAGE = 'com.mapconductor.basic';
const DEFAULT_IMAGE_URI =
  `android.resource://${ANDROID_PACKAGE}/drawable/newark_nj_1922_0`;
const CLICKED_IMAGE_URI =
  `android.resource://${ANDROID_PACKAGE}/drawable/newark_nj_1922_1`;

const INITIAL_SOUTH_WEST = createGeoPoint({
  latitude: 40.712216,
  longitude: -74.22655,
});
const INITIAL_NORTH_EAST = createGeoPoint({
  latitude: 40.773941,
  longitude: -74.12544,
});
const INIT_CAMERA = createMapCameraPosition({
  position: createGeoPoint({ latitude: 40.7430785, longitude: -74.175995 }),
  zoom: 12,
});

function markerLabels(southWest: MarkerState, northEast: MarkerState): [string, string] {
  const sw = southWest.position;
  const ne = northEast.position;
  const southWestLabel =
    sw.latitude <= ne.latitude
      ? sw.longitude <= ne.longitude ? 'SW' : 'SE'
      : sw.longitude <= ne.longitude ? 'NW' : 'NE';
  const northEastLabel =
    ne.latitude >= sw.latitude
      ? ne.longitude >= sw.longitude ? 'NE' : 'NW'
      : ne.longitude >= sw.longitude ? 'SE' : 'SW';
  return [southWestLabel, northEastLabel];
}

function markerIcon(color: string, label: string): ColorDefaultIcon {
  return new ColorDefaultIcon(color, {
    strokeColor: '#FFFFFF',
    label,
    labelTextColor: '#FFFFFF',
  });
}

function showGroundImageToast(): void {
  if (Platform.OS === 'android') {
    ToastAndroid.show('Ground Image clicked.', ToastAndroid.SHORT);
  }
}

export function GroundImagePage({ provider }: { provider: MapProvider }) {
  const [opacity, setOpacity] = useState(0.5);
  const groundImageRef = useRef<GroundImageState | null>(null);
  const markersRef = useRef<MarkerState[]>([]);

  const handleMarkerDrag = useCallback(() => {
    const [southWest, northEast] = markersRef.current;
    const groundImage = groundImageRef.current;
    if (!southWest || !northEast || !groundImage) return;

    const bounds = createGeoRectBounds();
    bounds.extend(southWest.position);
    bounds.extend(northEast.position);
    groundImage.bounds = bounds;

    const [southWestLabel, northEastLabel] = markerLabels(southWest, northEast);
    southWest.icon = markerIcon('#0000FF', southWestLabel);
    northEast.icon = markerIcon('#FF0000', northEastLabel);
  }, []);

  const [groundImageState] = useState(
    () =>
      createGroundImageState({
        id: 'groundImage',
        bounds: createGeoRectBounds({
          southWest: INITIAL_SOUTH_WEST,
          northEast: INITIAL_NORTH_EAST,
        }),
        imageUrl: DEFAULT_IMAGE_URI,
        opacity: 0.5,
        onClick: () => {
          const groundImage = groundImageRef.current;
          if (!groundImage) return;
          groundImage.imageUrl =
            groundImage.imageUrl === DEFAULT_IMAGE_URI
              ? CLICKED_IMAGE_URI
              : DEFAULT_IMAGE_URI;
          showGroundImageToast();
        },
      })
  );
  groundImageRef.current = groundImageState;

  const [markers] = useState(
    () => [
      createMarkerState({
        id: 'south_west',
        position: INITIAL_SOUTH_WEST,
        icon: markerIcon('#0000FF', 'SW'),
        draggable: true,
        onDrag: handleMarkerDrag,
      }),
      createMarkerState({
        id: 'north_east',
        position: INITIAL_NORTH_EAST,
        icon: markerIcon('#FF0000', 'NE'),
        draggable: true,
        onDrag: handleMarkerDrag,
      }),
    ]
  );
  markersRef.current = markers;

  const mapLibreState = useMapLibreViewState({
    id: 'ground-image-maplibre',
    mapDesignType: MapLibreDesign.DemoTiles,
    cameraPosition: INIT_CAMERA,
  });
  const googleState = useGoogleMapViewState({
    id: 'ground-image-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA,
  });
  const mapState = provider === 'google-maps' ? googleState : mapLibreState;

  const handleOpacityChange = (value: number) => {
    groundImageState.opacity = value;
    setOpacity(value);
  };

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer state={mapState} style={styles.map}>
        <GroundImage state={groundImageState} />
        {markers.map((marker) => <Marker key={marker.id} state={marker} />)}
      </MapViewContainer>

      <View style={styles.controlPanel}>
        <Text style={styles.title}>GroundImage Example</Text>
        <Text style={styles.label}>opacity: {opacity.toFixed(2)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={opacity}
          minimumTrackTintColor="#2563eb"
          maximumTrackTintColor="#cbd5e1"
          thumbTintColor="#2563eb"
          onValueChange={handleOpacityChange}
        />
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
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  title: {
    marginBottom: 8,
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  label: {
    color: '#475569',
    fontSize: 13,
  },
  slider: {
    width: '100%',
    height: 38,
  },
});
