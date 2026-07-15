import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  ColorDefaultIcon,
  GeoPoint,
  MapCameraPosition,
  createMarkerState,
  createPolygonState,
  type PolygonEvent,
} from '@mapconductor/js-sdk-core';
import { InfoBubbleAtPosition, Marker, Polygon } from '@mapconductor/js-sdk-react/native';
import {
  GoogleMapDesign,
  useGoogleMapViewState,
} from '@mapconductor/react-for-googlemaps';
import {
  MapLibreDesign,
  useMapLibreViewState,
} from '@mapconductor/react-for-maplibre';

import { california } from './click/California';
import type { MapProvider } from '../../screens/MapScreen';
import { MapViewContainer } from '../MapViewContainer';

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 36.7303, longitude: -120.24512 }),
  zoom: 5,
});

export function PolygonClickPage({ provider }: { provider: MapProvider }) {
  const [message, setMessage] = useState('Tap inside or outside the polygon.');
  const [markerVisible, setMarkerVisible] = useState(false);
  const lastPolygonClickRef = useRef<{ point: GeoPoint; time: number } | null>(null);
  const [markerState] = useState(() =>
    createMarkerState({
      id: 'polygon-clicked',
      position: INIT_CAMERA.position,
      icon: new ColorDefaultIcon('#ef4444', {
        label: 'P',
        labelTextColor: '#ffffff',
      }),
    })
  );

  const showClickedMarker = useCallback((point: GeoPoint, inside: boolean) => {
    markerState.position = point;
    markerState.animation = null;
    setMessage(inside ? `Inside\n${point.toUrlValue(5)}` : 'Outside');
    setMarkerVisible(true);
  }, [markerState]);

  const handlePolygonClick = useCallback((event: PolygonEvent) => {
    lastPolygonClickRef.current = { point: event.clicked, time: Date.now() };
    showClickedMarker(event.clicked, true);
  }, [showClickedMarker]);

  const handleMapClick = useCallback((point: GeoPoint) => {
    const lastPolygonClick = lastPolygonClickRef.current;
    if (
      lastPolygonClick &&
      Date.now() - lastPolygonClick.time < 250 &&
      lastPolygonClick.point.equals(point)
    ) {
      return;
    }
    showClickedMarker(point, false);
  }, [showClickedMarker]);

  const [polygons] = useState(() =>
    california.map((points, index) =>
      createPolygonState({
        id: `california-${index}`,
        points,
        strokeColor: 'rgba(255, 0, 0, 0.7)',
        strokeWidth: 3,
        fillColor: 'rgba(0, 0, 255, 0.4)',
        onClick: handlePolygonClick,
      })
    )
  );

  const mapLibreState = useMapLibreViewState({
    id: 'polygon-click-maplibre',
    mapDesignType: MapLibreDesign.DemoTiles,
    cameraPosition: INIT_CAMERA,
  });
  const googleState = useGoogleMapViewState({
    id: 'polygon-click-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA,
  });
  const mapState = provider === 'google-maps' ? googleState : mapLibreState;

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer state={mapState} style={styles.map} onMapClick={handleMapClick}>
        {polygons.map((polygon) => <Polygon key={polygon.id} state={polygon} />)}
        {markerVisible ? (
          <>
            <Marker state={markerState} />
            <InfoBubbleAtPosition position={markerState.position}>
              <Text style={styles.bubbleText}>{message}</Text>
            </InfoBubbleAtPosition>
          </>
        ) : null}
      </MapViewContainer>
      <View style={styles.controlPanel}>
        <Text style={styles.title}>Polygon Click Example</Text>
        <Text style={styles.note}>Tap inside or outside the polygon.</Text>
        <Text style={styles.message}>{message}</Text>
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
  note: { color: '#475569', fontSize: 13 },
  message: { marginTop: 8, color: '#111827', fontSize: 13, lineHeight: 19 },
  bubbleText: { color: '#111827', fontSize: 14, lineHeight: 19 },
});
