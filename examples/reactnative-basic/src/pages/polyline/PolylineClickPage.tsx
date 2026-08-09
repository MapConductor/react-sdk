import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  ColorDefaultIcon,
  GeoPoint,
  MapCameraPosition,
  MarkerAnimation,
  createMarkerState,
  createPolylineState,
  type PolylineEvent,
} from '@mapconductor/js-sdk-core';
import { InfoBubble, Marker, Polyline } from '@mapconductor/js-sdk-react/native';
import { MapLibreDesign } from '@mapconductor/reactnative-for-maplibre';

import type { MapProvider } from '../../providers/types';
import { MapViewContainer } from '../MapViewContainer';

const POINTS = [
  GeoPoint.from({ latitude: 35.548852, longitude: 139.784086 }),
  GeoPoint.from({ latitude: 37.615223, longitude: -122.389979 }),
  GeoPoint.from({ latitude: 21.324513, longitude: -157.925074 }),
];
const INIT_CAMERA = MapCameraPosition.from({
  position: POINTS[0],
  zoom: 4,
});

export function PolylineClickPage({ provider }: { provider: MapProvider }) {
  const [clicked, setClicked] = useState<GeoPoint | null>(null);
  const [markerState] = useState(() =>
    createMarkerState({
      id: 'polyline-clicked',
      position: POINTS[0],
      icon: new ColorDefaultIcon({ fillColor: '#ff0000' }),
    })
  );
  const handleClick = useCallback((event: PolylineEvent) => {
    markerState.position = event.clicked;
    markerState.icon = new ColorDefaultIcon({ fillColor: event.state.strokeColor });
    markerState.animate(MarkerAnimation.Drop);
    setClicked(event.clicked);
  }, [markerState]);
  const [curvedPolyline] = useState(() =>
    createPolylineState({
      id: 'example-polyline-curved', points: POINTS, strokeColor: '#ff0000', strokeWidth: 4,
      geodesic: true,
      onClick: handleClick,
    })
  );
  const [straightPolyline] = useState(() =>
    createPolylineState({
      id: 'example-polyline-straight', points: POINTS, strokeColor: '#0000ff', strokeWidth: 4,
      geodesic: false,
      onClick: handleClick,
    })
  );

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer
        provider={provider}
        cameraPosition={INIT_CAMERA}
        mapId="polyline-click"
        style={styles.map}
        designTypes={{ maplibre: MapLibreDesign.DemoTiles }}
      >
        <Polyline state={curvedPolyline} />
        <Polyline state={straightPolyline} />
        {clicked ? <><Marker state={markerState} /><InfoBubble position={clicked}><Text style={styles.bubbleText}>Clicked polyline</Text></InfoBubble></> : null}
      </MapViewContainer>
      <View style={styles.controlPanel}>
        <Text style={styles.title}>Polyline Click</Text>
        <Text style={styles.note}>Tap the curved red polyline to place a marker.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: { flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' },
  map: { flex: 1 },
  controlPanel: { position: 'absolute', left: 16, right: 16, bottom: 20, maxWidth: 380, padding: 16, borderRadius: 8, backgroundColor: '#ffffff', elevation: 5 },
  title: { marginBottom: 6, color: '#111827', fontSize: 16, fontWeight: '700' },
  note: { color: '#475569', fontSize: 13, lineHeight: 19 },
  bubbleText: { color: '#111827', fontSize: 14, fontWeight: '600' },
});
