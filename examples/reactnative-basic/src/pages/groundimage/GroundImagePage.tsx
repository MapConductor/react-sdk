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
import { MapLibreDesign } from '@mapconductor/reactnative-for-maplibre';

import type { MapProvider } from '../../providers/types';
import { MapViewContainer } from '../MapViewContainer';

const ANDROID_PACKAGE = 'com.mapconductor.basic';
// Drone imagery over the University of Eswatini campus — the same sample content
// as examples/basic (web) and android-sdk / ios-sdk's GroundImage pages.
const GROUND_IMAGE_URI = Platform.OS === 'ios'
  ? 'bundle://university_of_eswatini'
  : `android.resource://${ANDROID_PACKAGE}/drawable/university_of_eswatini`;

const INITIAL_SOUTH_WEST = createGeoPoint({
  latitude: -26.484901389754125,
  longitude: 31.2995982170105,
});
const INITIAL_NORTH_EAST = createGeoPoint({
  latitude: -26.473569450536356,
  longitude: 31.31288051605225,
});
const INIT_CAMERA = createMapCameraPosition({
  position: createGeoPoint({ latitude: -26.479235, longitude: 31.306239 }),
  zoom: 15,
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
  return new ColorDefaultIcon({ fillColor: color, strokeColor: '#FFFFFF',
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
  const [opacity, setOpacity] = useState(1.0);
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
        imageUrl: GROUND_IMAGE_URI,
        opacity: 1.0,
        onClick: () => showGroundImageToast(),
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

  const handleOpacityChange = (value: number) => {
    groundImageState.opacity = value;
    setOpacity(value);
  };

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer
        provider={provider}
        cameraPosition={INIT_CAMERA}
        mapId="ground-image"
        style={styles.map}
        designTypes={{ maplibre: MapLibreDesign.DemoTiles }}
      >
        <GroundImage state={groundImageState} />
        {markers.map((marker) => <Marker key={marker.id} state={marker} />)}
      </MapViewContainer>

      <View style={styles.controlPanel}>
        <Text style={styles.title}>Ground Image</Text>
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
        <Text style={styles.note}>南西／北東マーカーをドラッグして画像範囲を変更できます。</Text>
        <Text style={styles.note}>
          Aerial imagery (c) Open Imagery Network contributors, accessed via OpenAerialMap,
          licensed under CC BY 4.0.
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
  note: {
    marginTop: 6,
    color: '#64748b',
    fontSize: 11,
    lineHeight: 15,
  },
});
