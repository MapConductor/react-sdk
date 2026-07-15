import React, { useRef, useState } from 'react';
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
} from '@mapconductor/react-for-googlemaps';
import {
  MapLibreDesign,
  useMapLibreViewState,
} from '@mapconductor/react-for-maplibre';

import type { MapProvider } from '../../screens/MapScreen';
import { MapViewContainer } from '../MapViewContainer';

const WORLD_POINTS = [
  GeoPoint.from({ latitude: 85, longitude: 90 }),
  GeoPoint.from({ latitude: 85, longitude: 0.1 }),
  GeoPoint.from({ latitude: 85, longitude: -90 }),
  GeoPoint.from({ latitude: 85, longitude: -179.9 }),
  GeoPoint.from({ latitude: -85, longitude: -179.9 }),
  GeoPoint.from({ latitude: -85, longitude: -90 }),
  GeoPoint.from({ latitude: -85, longitude: 0.1 }),
  GeoPoint.from({ latitude: -85, longitude: 90 }),
  GeoPoint.from({ latitude: -85, longitude: 179.9 }),
  GeoPoint.from({ latitude: 85, longitude: 179.9 }),
];

const INITIAL_HOLES = [
  [
    GeoPoint.from({ latitude: 43.100869, longitude: 141.352909 }),
    GeoPoint.from({ latitude: 43.044443, longitude: 141.411895 }),
    GeoPoint.from({ latitude: 43.050601, longitude: 141.306563 }),
  ],
  [
    GeoPoint.from({ latitude: 43.060351, longitude: 141.319905 }),
    GeoPoint.from({ latitude: 43.038285, longitude: 141.333247 }),
    GeoPoint.from({ latitude: 43.049062, longitude: 141.286901 }),
  ],
];

const HOLE_MARKER_COLORS = ['#2563eb', '#f97316'];
const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 43.0602, longitude: 141.3195 }),
  zoom: 11,
});

interface HoleVertex {
  holeIndex: number;
  vertexIndex: number;
}

export function PolygonHolePage({ provider }: { provider: MapProvider }) {
  const holesRef = useRef(INITIAL_HOLES.map((hole) => [...hole]));
  const [polygonState] = useState(() =>
    createPolygonState({
      id: 'world-hole',
      points: WORLD_POINTS,
      holes: INITIAL_HOLES,
      fillColor: 'rgba(120, 120, 128, 0.8)',
      strokeColor: '#ef4444',
      strokeWidth: 2,
    })
  );

  const updateHoleVertex = (dragged: MarkerState) => {
    const vertex = dragged.extra as unknown as HoleVertex;
    if (!vertex || vertex.holeIndex < 0 || vertex.vertexIndex < 0) return;
    const currentHoles = holesRef.current;
    const hole = currentHoles[vertex.holeIndex];
    if (!hole || !hole[vertex.vertexIndex]) return;

    const nextHoles = currentHoles.map((currentHole, holeIndex) =>
      holeIndex === vertex.holeIndex
        ? currentHole.map((point, vertexIndex) =>
            vertexIndex === vertex.vertexIndex ? dragged.position : point
          )
        : currentHole
    );
    holesRef.current = nextHoles;
    polygonState.holes = nextHoles;
  };

  const [holeVertexMarkers] = useState(() =>
    INITIAL_HOLES.flatMap((hole, holeIndex) =>
      hole.map((point, vertexIndex) =>
        createMarkerState({
          id: `hole-${holeIndex}-${vertexIndex}`,
          position: point,
          draggable: true,
          clickable: false,
          extra: { holeIndex, vertexIndex } satisfies HoleVertex,
          icon: new ColorDefaultIcon(HOLE_MARKER_COLORS[holeIndex] ?? '#64748b', {
            label: `${holeIndex + 1}-${vertexIndex + 1}`,
            labelTextColor: '#ffffff',
            strokeColor: '#ffffff',
          }),
          onDrag: updateHoleVertex,
          onDragEnd: updateHoleVertex,
        })
      )
    )
  );

  const mapLibreState = useMapLibreViewState({
    id: 'polygon-hole-maplibre',
    mapDesignType: MapLibreDesign.DemoTiles,
    cameraPosition: INIT_CAMERA,
  });
  const googleState = useGoogleMapViewState({
    id: 'polygon-hole-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA,
  });
  const mapState = provider === 'google-maps' ? googleState : mapLibreState;

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer state={mapState} style={styles.map}>
        <Polygon state={polygonState} />
        <Markers states={holeVertexMarkers} />
      </MapViewContainer>
      <View style={styles.controlPanel}>
        <Text style={styles.title}>Hole Polygon Example</Text>
        <Text style={styles.note}>
          A world-covering polygon with two triangular holes near Sapporo.{`\n`}
          Drag hole vertex markers to reshape the holes.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: { flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' },
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
  title: { marginBottom: 8, color: '#111827', fontSize: 16, fontWeight: '700' },
  note: { color: '#475569', fontSize: 13, lineHeight: 19 },
});
