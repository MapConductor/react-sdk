import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  ColorDefaultIcon,
  GeoPoint,
  MapCameraPosition,
  createGeoRectBounds,
  createMarkerState,
  createPolygonState,
  type CameraRestriction,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { Markers, Polygon } from '@mapconductor/js-sdk-react/native';
import { MapLibreDesign } from '@mapconductor/reactnative-for-maplibre';

import type { MapProvider } from '../../providers/types';
import { MapViewContainer } from '../MapViewContainer';

// 外周リングは「札幌周辺だけ」に留める。半球規模に近いリングは各プロバイダの
// 三角形分割が破綻し、塗りが反転したり消えたりする（HERE で顕著）。
// examples/basic (web) と android-sdk の example-app も同じ理由で地域リングにしてある。
const OUTER_POINTS = [
  GeoPoint.from({ latitude: 44.2, longitude: 140.0 }),
  GeoPoint.from({ latitude: 44.2, longitude: 142.8 }),
  GeoPoint.from({ latitude: 42.0, longitude: 142.8 }),
  GeoPoint.from({ latitude: 42.0, longitude: 140.0 }),
];

// 外周リングと完全に一致させる。こうするとパンの端がポリゴンのカバー範囲と揃い、
// 「マスクの外」が見えてしまうことがない。
const CAMERA_RESTRICTION: CameraRestriction = {
  bounds: createGeoRectBounds({
    southWest: GeoPoint.from({ latitude: 42.0, longitude: 140.0 }),
    northEast: GeoPoint.from({ latitude: 44.2, longitude: 142.8 }),
  }),
  minZoom: 9,
  maxZoom: 16,
};

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
      id: 'sapporo-hole',
      points: OUTER_POINTS,
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
          icon: new ColorDefaultIcon({ fillColor: HOLE_MARKER_COLORS[holeIndex] ?? '#64748b', label: `${holeIndex + 1}-${vertexIndex + 1}`,
            labelTextColor: '#ffffff',
            strokeColor: '#ffffff',
          }),
          onDrag: updateHoleVertex,
          onDragEnd: updateHoleVertex,
        })
      )
    )
  );

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer
        provider={provider}
        cameraPosition={INIT_CAMERA}
        mapId="polygon-hole"
        style={styles.map}
        designTypes={{ maplibre: MapLibreDesign.DemoTiles }}
        cameraRestriction={CAMERA_RESTRICTION}
      >
        <Polygon state={polygonState} />
        <Markers states={holeVertexMarkers} />
      </MapViewContainer>
      <View style={styles.controlPanel}>
        <Text style={styles.title}>Hole Polygon Example</Text>
        <Text style={styles.note}>
          A regional polygon covering the Sapporo area with two triangular holes.{`\n`}
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
