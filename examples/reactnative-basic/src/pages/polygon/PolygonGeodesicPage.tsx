import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  ColorDefaultIcon,
  GeoPoint,
  MapCameraPosition,
  MarkerAnimation,
  createMarkerState,
  createPolygonState,
  type PolygonEvent,
} from '@mapconductor/js-sdk-core';
import { InfoBubbleAtPosition, Marker, Polygon } from '@mapconductor/js-sdk-react/native';
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

const POINTS = [
  GeoPoint.from({ latitude: 56.42, longitude: 23.66, altitude: 5000 }),
  GeoPoint.from({ latitude: 2.95, longitude: 13.39, altitude: 5000 }),
  GeoPoint.from({ latitude: 38.58, longitude: -87.82, altitude: 5000 }),
  GeoPoint.from({ latitude: 56.42, longitude: 23.66, altitude: 5000 }),
];

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 30, longitude: 0 }),
  zoom: 1,
});

export function PolygonGeodesicPage({ provider }: { provider: MapProvider }) {
  const [clicked, setClicked] = useState<{ position: GeoPoint; label: string } | null>(null);
  const [markerState] = useState(() =>
    createMarkerState({
      id: 'polygon-geodesic-clicked',
      position: POINTS[0],
      icon: new ColorDefaultIcon('#22c55e', {
        label: 'P',
        labelTextColor: '#ffffff',
      }),
    })
  );
  const handlePolygonClick = useCallback((label: string, event: PolygonEvent) => {
    markerState.position = event.clicked;
    markerState.icon = new ColorDefaultIcon(event.state.fillColor, {
      label: 'P',
      labelTextColor: '#ffffff',
    });
    markerState.animate(MarkerAnimation.Drop);
    setClicked({ position: event.clicked, label });
  }, [markerState]);

  const [linearPolygon] = useState(() =>
    createPolygonState({
      id: 'linear-polygon',
      points: POINTS,
      strokeColor: 'rgba(255, 255, 0, 0.3)',
      strokeWidth: 3,
      fillColor: 'rgba(0, 255, 0, 0.5)',
      geodesic: false,
      zIndex: 0,
      onClick: (event) => handlePolygonClick('Green polygon', event),
    })
  );
  const [geodesicPolygon] = useState(() =>
    createPolygonState({
      id: 'geodesic-polygon',
      points: POINTS,
      strokeColor: 'rgba(255, 0, 0, 0.3)',
      strokeWidth: 3,
      fillColor: 'rgba(0, 0, 255, 0.5)',
      geodesic: true,
      zIndex: 1,
      onClick: (event) => handlePolygonClick('Blue polygon', event),
    })
  );

  const mapLibreState = useMapLibreViewState({
    id: 'polygon-geodesic-maplibre',
    mapDesignType: MapLibreDesign.DemoTiles,
    cameraPosition: INIT_CAMERA,
  });
  const googleState = useGoogleMapViewState({
    id: 'polygon-geodesic-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA,
  });
  const mapState = provider === 'google-maps' ? googleState : mapLibreState;

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer state={mapState} style={styles.map}>
        <Polygon state={linearPolygon} />
        <Polygon state={geodesicPolygon} />
        {clicked ? (
          <>
            <Marker state={markerState} />
            <InfoBubbleAtPosition position={clicked.position}>
              <Text style={styles.bubbleText}>{clicked.label}</Text>
            </InfoBubbleAtPosition>
          </>
        ) : null}
      </MapViewContainer>
      <View style={styles.controlPanel}>
        <Text style={styles.title}>Polygon Geodesic Example</Text>
        <Text style={styles.note}>
          Tap on the polygons.{`\n`}
          Green uses straight edges; blue uses geodesic interpolation.{`\n`}
          A marker is placed at the clicked point.
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
  bubbleText: { color: '#111827', fontSize: 14, fontWeight: '600' },
});
