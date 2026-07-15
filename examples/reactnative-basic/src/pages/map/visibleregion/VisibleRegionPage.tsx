import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  GeoPoint,
  MapCameraPosition,
  type GeoPointInterface,
  type GeoRectBounds,
} from '@mapconductor/js-sdk-core';
import {
  GoogleMapDesign,
  useGoogleMapViewState,
} from '@mapconductor/react-for-googlemaps';
import {
  MapLibreDesign,
  useMapLibreViewState,
} from '@mapconductor/react-for-maplibre';
import { MapViewContainer } from '../../MapViewContainer';

type MapProvider = 'maplibre' | 'google-maps';

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 21.3069, longitude: -157.8583, altitude: 0 }),
  zoom: 10,
  bearing: 0,
  tilt: 0,
});

function formatNumber(value: number | null | undefined, digits: number): string {
  return typeof value === 'number' ? value.toFixed(digits) : 'Unavailable';
}

function formatPoint(point: GeoPointInterface | null | undefined): string {
  if (!point) return 'Unavailable';
  return `${point.latitude.toFixed(5)},${point.longitude.toFixed(5)}`;
}

function formatBounds(bounds: GeoRectBounds | null | undefined): string {
  if (!bounds?.southWest || !bounds.northEast) return 'Unavailable';
  return `${formatPoint(bounds.southWest)},${formatPoint(bounds.northEast)}`;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} selectable>
        {value}
      </Text>
    </View>
  );
}

function VisibleRegionPanel({ cameraPosition }: { cameraPosition: MapCameraPosition | null }) {
  const visibleRegion = cameraPosition?.visibleRegion ?? null;

  return (
    <View style={styles.controlPanel}>
      <Text style={styles.controlPanelTitle}>Visible Region</Text>
      <ScrollView style={styles.infoList} contentContainerStyle={styles.infoListContent}>
        <InfoRow label="Center" value={formatPoint(cameraPosition?.position)} />
        <InfoRow label="Zoom" value={formatNumber(cameraPosition?.zoom, 2)} />
        <InfoRow label="Bearing" value={`${formatNumber(cameraPosition?.bearing, 1)} deg`} />
        <InfoRow label="Tilt" value={`${formatNumber(cameraPosition?.tilt, 1)} deg`} />
        <InfoRow label="Bounds" value={formatBounds(visibleRegion?.bounds)} />
        <InfoRow label="Near Left" value={formatPoint(visibleRegion?.nearLeft)} />
        <InfoRow label="Near Right" value={formatPoint(visibleRegion?.nearRight)} />
        <InfoRow label="Far Left" value={formatPoint(visibleRegion?.farLeft)} />
        <InfoRow label="Far Right" value={formatPoint(visibleRegion?.farRight)} />
      </ScrollView>
    </View>
  );
}

function VisibleRegionMap({
  provider,
  mapLibreState,
  googleState,
  onCameraMove,
}: {
  provider: MapProvider;
  mapLibreState: ReturnType<typeof useMapLibreViewState>;
  googleState: ReturnType<typeof useGoogleMapViewState>;
  onCameraMove: (camera: MapCameraPosition) => void;
}) {
  const state = provider === 'google-maps' ? googleState : mapLibreState;
  return (
    <MapViewContainer
      state={state}
      style={styles.map}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMove}
    />
  );
}

export function VisibleRegionPage({ provider }: { provider: MapProvider }) {
  const [cameraPosition, setCameraPosition] = useState<MapCameraPosition | null>(null);

  const mapLibreState = useMapLibreViewState({
    id: 'visible-region-maplibre',
    mapDesignType: MapLibreDesign.DemoTiles,
    cameraPosition: INIT_CAMERA,
  });
  const googleState = useGoogleMapViewState({
    id: 'visible-region-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA,
  });

  return (
    <View style={styles.mapContainer}>
      <VisibleRegionMap
        provider={provider}
        mapLibreState={mapLibreState}
        googleState={googleState}
        onCameraMove={setCameraPosition}
      />
      <VisibleRegionPanel cameraPosition={cameraPosition} />
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
    maxWidth: 420,
    maxHeight: 330,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  controlPanelTitle: {
    marginBottom: 10,
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  infoList: {
    flexGrow: 0,
  },
  infoListContent: {
    rowGap: 8,
  },
  infoRow: {
    gap: 3,
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: '#111827',
    fontSize: 13,
    lineHeight: 18,
  },
});
