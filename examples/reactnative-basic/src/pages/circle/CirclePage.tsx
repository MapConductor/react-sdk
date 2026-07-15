import React, { useCallback, useRef, useState } from 'react';
import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';

import {
  calculatePositionAtDistance,
  ColorDefaultIcon,
  computeDistanceBetween,
  createCircleState,
  createGeoPoint,
  createMapCameraPosition,
  createMarkerState,
  createPolylineState,
  type CircleState,
  type MarkerState,
  type PolylineState,
} from '@mapconductor/js-sdk-core';
import {
  Circle,
  Marker,
  Polyline,
} from '@mapconductor/js-sdk-react/native';
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

const CIRCLE_CENTER = createGeoPoint({ latitude: 21.382314, longitude: -157.933097 });
const INIT_CAMERA = createMapCameraPosition({
    position: CIRCLE_CENTER,
    zoom: 12,
  });
const INITIAL_RADIUS_METERS = 1000;
const INITIAL_EDGE_POSITION = calculatePositionAtDistance({
  center: CIRCLE_CENTER,
  distanceMeters: INITIAL_RADIUS_METERS,
  bearingDegrees: 90,
});
const SUPPRESS_CIRCLE_CLICK_AFTER_MARKER_DRAG_MS = 300;
const CIRCLE_COLORS = ['#0000ff', '#ff0000', '#008000', '#00ffff', '#d3d3d3', '#ff00ff'];

function rgba(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function CirclePage({ provider }: { provider: MapProvider }) {
  const [colorIndex, setColorIndex] = useState(0);
  const [fillOpacity, setFillOpacity] = useState(0.3);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const suppressCircleClickUntilRef = useRef(0);
  const fillOpacityRef = useRef(fillOpacity);
  const circleStateRef = useRef<CircleState | null>(null);
  const radiusLineStateRef = useRef<PolylineState | null>(null);

  const handleMarkerMove = useCallback((dragged: MarkerState) => {
    if (circleStateRef.current) {
      circleStateRef.current.radiusMeters = computeDistanceBetween(
        CIRCLE_CENTER,
        dragged.position
      );
    }
    if (radiusLineStateRef.current) {
      radiusLineStateRef.current.points = [CIRCLE_CENTER, dragged.position];
    }
  }, []);

  const handleMarkerDragEnd = useCallback((dragged: MarkerState) => {
    handleMarkerMove(dragged);
    suppressCircleClickUntilRef.current =
      Date.now() + SUPPRESS_CIRCLE_CLICK_AFTER_MARKER_DRAG_MS;
  }, [handleMarkerMove]);

  const [circleState] = useState(
    () =>
      createCircleState({
        id: 'circle',
        center: CIRCLE_CENTER,
        radiusMeters: INITIAL_RADIUS_METERS,
        fillColor: rgba(CIRCLE_COLORS[0], 0.3),
        strokeColor: 'rgba(0, 0, 255, 0.5)',
        strokeWidth: 3,
        clickable: true,
        onClick: () => {
          if (Date.now() < suppressCircleClickUntilRef.current) return;
          setColorIndex((index) => {
            const nextIndex = (index + 1) % CIRCLE_COLORS.length;
            if (circleStateRef.current) {
              circleStateRef.current.fillColor = rgba(
                CIRCLE_COLORS[nextIndex],
                fillOpacityRef.current
              );
            }
            return nextIndex;
          });
        },
      })
  );
  circleStateRef.current = circleState;

  const [radiusLineState] = useState(
    () =>
      createPolylineState({
        id: 'circle-radius-line',
        points: [CIRCLE_CENTER, INITIAL_EDGE_POSITION],
        strokeColor: '#ffffff',
        strokeWidth: 3,
      })
  );
  radiusLineStateRef.current = radiusLineState;

  const [centerMarkerState] = useState(
    () =>
      createMarkerState({
        id: 'center_marker',
        position: CIRCLE_CENTER,
        icon: new ColorDefaultIcon('#FF0000', {
          strokeColor: '#FFFFFF',
          label: 'C',
        }),
        clickable: false,
        draggable: false,
      })
  );
  const [edgeMarkerState] = useState(
    () =>
      createMarkerState({
        id: 'edge_marker',
        position: INITIAL_EDGE_POSITION,
        icon: new ColorDefaultIcon('#008000', {
          strokeColor: '#FFFFFF',
          label: 'E',
        }),
        draggable: true,
        onDragStart: handleMarkerMove,
        onDrag: handleMarkerMove,
        onDragEnd: handleMarkerDragEnd,
      })
  );

  const mapLibreState = useMapLibreViewState({
    id: 'circle-maplibre',
    mapDesignType: MapLibreDesign.DemoTiles,
    cameraPosition: INIT_CAMERA,
  });
  const googleState = useGoogleMapViewState({
    id: 'circle-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA,
  });
  const state = provider === 'google-maps' ? googleState : mapLibreState;

  const handleFillOpacityChange = (value: number) => {
    fillOpacityRef.current = value;
    circleState.fillColor = rgba(CIRCLE_COLORS[colorIndex], value);
    setFillOpacity(value);
  };

  const handleStrokeWidthChange = (value: number) => {
    circleState.strokeWidth = value;
    setStrokeWidth(value);
  };

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer state={state} style={styles.map}>
        <Circle state={circleState} />
        <Polyline state={radiusLineState} />
        <Marker state={centerMarkerState} />
        <Marker state={edgeMarkerState} />
      </MapViewContainer>
      <View style={styles.controlPanel}>
        <Text style={styles.title}>Circle Example</Text>
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
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 38,
  },
});
