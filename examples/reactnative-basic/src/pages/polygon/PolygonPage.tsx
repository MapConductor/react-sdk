import React, { useState } from 'react';
import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';

import {
  ColorDefaultIcon,
  GeoPoint,
  MapCameraPosition,
  createMarkerState,
  createPolygonState,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { Markers, Polygon } from '@mapconductor/js-sdk-react/native';
import {
  GoogleMapDesign,
  useGoogleMapViewState,
} from '@mapconductor/reactnative-for-googlemaps';
import {
  MapLibreDesign,
  useMapLibreViewState,
} from '@mapconductor/reactnative-for-maplibre';

import type { MapProvider } from '../../screens/MapScreen';
import { MapViewContainer } from '../MapViewContainer';

const POLYGON_VERTICES = [
  GeoPoint.from({ latitude: 41.79883, longitude: 140.75675 }),
  GeoPoint.from({ latitude: 41.79924, longitude: 140.75875 }),
  GeoPoint.from({ latitude: 41.79765, longitude: 140.75905 }),
  GeoPoint.from({ latitude: 41.79637, longitude: 140.76018 }),
  GeoPoint.from({ latitude: 41.79567, longitude: 140.75845 }),
  GeoPoint.from({ latitude: 41.79447, longitude: 140.75714 }),
  GeoPoint.from({ latitude: 41.79501, longitude: 140.75611 }),
  GeoPoint.from({ latitude: 41.79477, longitude: 140.75484 }),
  GeoPoint.from({ latitude: 41.79576, longitude: 140.75475 }),
  GeoPoint.from({ latitude: 41.79615, longitude: 140.75364 }),
  GeoPoint.from({ latitude: 41.79744, longitude: 140.75454 }),
  GeoPoint.from({ latitude: 41.79909, longitude: 140.75465 }),
];

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 41.796855, longitude: 140.75691 }),
  zoom: 16,
  bearing: 0,
  tilt: 0,
});

export function PolygonPage({ provider }: { provider: MapProvider }) {
  const [fillOpacity, setFillOpacity] = useState(0.3);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [polygonState] = useState(() =>
    createPolygonState({
      id: 'example_polygon',
      points: POLYGON_VERTICES,
      strokeColor: '#e74c3c',
      strokeWidth: 3,
      fillColor: 'rgba(0, 100, 230, 0.3)',
      geodesic: false,
    })
  );

  const handleVertexDrag = (dragged: MarkerState) => {
    const index = typeof dragged.extra === 'number' ? dragged.extra : -1;
    if (index < 0 || index >= polygonState.points.length) return;
    const points = [...polygonState.points];
    points[index] = dragged.position;
    polygonState.points = points;
  };

  const [vertexMarkers] = useState(() =>
    POLYGON_VERTICES.map((point, index) =>
      createMarkerState({
        id: `vertex_${index}`,
        position: point,
        extra: index,
        draggable: true,
        icon: new ColorDefaultIcon('#FFFF00', {
          scale: 0.7,
          strokeColor: '#000000',
        }),
        onDrag: handleVertexDrag,
      })
    )
  );

  const mapLibreState = useMapLibreViewState({
    id: 'polygon-basic-maplibre',
    mapDesignType: MapLibreDesign.DemoTiles,
    cameraPosition: INIT_CAMERA,
  });
  const googleState = useGoogleMapViewState({
    id: 'polygon-basic-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA,
  });
  const mapState = provider === 'google-maps' ? googleState : mapLibreState;

  const handleFillOpacityChange = (value: number) => {
    polygonState.fillColor = `rgba(0, 100, 230, ${value})`;
    setFillOpacity(value);
  };

  const handleStrokeWidthChange = (value: number) => {
    polygonState.strokeWidth = value;
    setStrokeWidth(value);
  };

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer state={mapState} style={styles.map}>
        <Polygon state={polygonState} />
        <Markers states={vertexMarkers} />
      </MapViewContainer>

      <View style={styles.controlPanel}>
        <Text style={styles.title}>Polygon Example</Text>
        <Text style={styles.label}>Fill Opacity: {fillOpacity.toFixed(1)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={fillOpacity}
          minimumTrackTintColor="#2563eb"
          maximumTrackTintColor="#cbd5e1"
          thumbTintColor="#2563eb"
          onValueChange={handleFillOpacityChange}
        />
        <Text style={styles.label}>Stroke Width: {strokeWidth.toFixed(1)}dp</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10}
          value={strokeWidth}
          minimumTrackTintColor="#2563eb"
          maximumTrackTintColor="#cbd5e1"
          thumbTintColor="#2563eb"
          onValueChange={handleStrokeWidthChange}
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
  title: {
    marginBottom: 8,
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  label: { color: '#475569', fontSize: 13 },
  slider: { width: '100%', height: 38 },
});
