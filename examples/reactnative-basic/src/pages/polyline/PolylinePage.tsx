import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  ColorDefaultIcon,
  GeoPoint,
  MapCameraPosition,
  createMarkerState,
  createPolylineState,
} from '@mapconductor/js-sdk-core';
import { Markers, Polyline } from '@mapconductor/js-sdk-react/native';
import { GoogleMapDesign, useGoogleMapViewState } from '@mapconductor/react-for-googlemaps';
import { MapLibreDesign, useMapLibreViewState } from '@mapconductor/react-for-maplibre';

import type { MapProvider } from '../../screens/MapScreen';
import { MapViewContainer } from '../MapViewContainer';

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 21.382314, longitude: -157.933097 }),
  zoom: 15,
});

const INITIAL_POINTS = [
  GeoPoint.from({ latitude: 21.382314, longitude: -157.933097 }),
  GeoPoint.from({ latitude: 21.385314, longitude: -157.930097 }),
  GeoPoint.from({ latitude: 21.387314, longitude: -157.935097 }),
  GeoPoint.from({ latitude: 21.380314, longitude: -157.937097 }),
  GeoPoint.from({ latitude: 21.378314, longitude: -157.930097 }),
  GeoPoint.from({ latitude: 21.382314, longitude: -157.933097 }),
];

export function PolylinePage({ provider }: { provider: MapProvider }) {
  const [polylineState] = useState(() =>
    createPolylineState({
      id: 'example-polyline',
      points: INITIAL_POINTS,
      strokeColor: '#ff0000',
      strokeWidth: 4,
      geodesic: true,
    })
  );
  const [waypointMarkers] = useState(() =>
    INITIAL_POINTS.map((point, index) =>
      createMarkerState({
        id: `waypoint-${index}`,
        position: point,
        icon: new ColorDefaultIcon(index === 0 || index === INITIAL_POINTS.length - 1 ? '#22c55e' : '#ffff00', {
          label: index === 0 ? 'S' : index === INITIAL_POINTS.length - 1 ? 'E' : `${index}`,
          strokeColor: '#000000',
          labelTextColor: '#000000',
        }),
        draggable: true,
        extra: index,
        onDrag: (dragged) => {
          const draggedIndex = dragged.extra;
          if (typeof draggedIndex !== 'number') return;
          const nextPoints = [...polylineState.points];
          nextPoints[draggedIndex] = dragged.position;
          polylineState.points = nextPoints;
        },
      })
    )
  );
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
  const mapState = provider === 'google-maps' ? googleState : mapLibreState;

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer state={mapState} style={styles.map}>
        <Polyline state={polylineState} />
        <Markers states={waypointMarkers} />
      </MapViewContainer>
      <View style={styles.controlPanel}>
        <Text style={styles.title}>Polyline</Text>
        <Text style={styles.note}>Drag the waypoint markers to change the route.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: { flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' },
  map: { flex: 1 },
  controlPanel: {
    position: 'absolute', left: 16, right: 16, bottom: 20, maxWidth: 380,
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8,
    backgroundColor: '#ffffff', shadowColor: '#000000', shadowOpacity: 0.25,
    shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 5,
  },
  title: { marginBottom: 6, color: '#111827', fontSize: 16, fontWeight: '700' },
  note: { color: '#475569', fontSize: 13, lineHeight: 19 },
});
