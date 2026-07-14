import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  GeoPoint,
  MapCameraPosition,
  MarkerTilingOptions,
  createMarkerState,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { InfoBubble, Markers, ReactNativeImageIcon } from '@mapconductor/js-sdk-react/native';
import {
  GoogleMapDesign,
  GoogleMapView,
  useGoogleMapViewState,
} from '@mapconductor/react-for-googlemaps';
import {
  MapLibreDesign,
  MapLibreView,
  useMapLibreViewState,
} from '@mapconductor/react-for-maplibre';

import postOfficesJson from '../../../data/postoffice/postoffices.json';

type MapProvider = 'maplibre' | 'google-maps';
type PostOfficeRow = [number, number, string, string];

interface PostOfficeExtra {
  name: string;
  address: string;
}

const POST_OFFICES = postOfficesJson as PostOfficeRow[];
const ANDROID_PACKAGE = 'com.mapconductor.basic';
const POST_OFFICE_ICON_URI = `android.resource://${ANDROID_PACKAGE}/drawable/postoffice`;

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 35.68049, longitude: 139.76669, altitude: 0 }),
  zoom: 10,
  bearing: 0,
  tilt: 0,
});

const MARKER_TILING_OPTIONS: MarkerTilingOptions = {
  ...MarkerTilingOptions.Default,
  iconScaleCallback: (_state, zoom) => {
    if (zoom > 12)  return 1.3;
    if (zoom > 10)  return 1.0;
    if (zoom > 8)  return 0.8;
    if (zoom > 5)  return 0.5;
    return 0.2;
  },
};

function PostOfficeInfoView({
  info,
  marker,
  onZoom,
}: {
  info: PostOfficeExtra;
  marker: MarkerState;
  onZoom: (marker: MarkerState) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.infoBubbleContent}
      activeOpacity={0.78}
      onPress={() => onZoom(marker)}
    >
      <Text style={styles.infoTitle} numberOfLines={2}>
        {info.name}
      </Text>
      <Text style={styles.infoAddress} numberOfLines={3}>
        {info.address}
      </Text>
    </TouchableOpacity>
  );
}

function PostOfficeMarkers({ onSelectMarker }: { onSelectMarker: (marker: MarkerState) => void }) {
  const icon = useMemo(
    () =>
      Platform.OS === 'android'
        ? new ReactNativeImageIcon(POST_OFFICE_ICON_URI, { scale: 0.5 })
        : null,
    []
  );

  const markers = useMemo(
    () =>
      POST_OFFICES.map(([latitude, longitude, name, address], index) =>
          createMarkerState({
            id: `post-office-${index}`,
            position: GeoPoint.from({ latitude, longitude, altitude: 0 }),
            extra: { name, address } satisfies PostOfficeExtra,
            icon,
            clickable: true,
            onClick: onSelectMarker,
          })
      ),
    [onSelectMarker]
  );

  return <Markers states={markers} />;
}

function PostOfficeMap({
  provider,
  mapLibreState,
  googleState,
  selectedMarker,
  onMapLoaded,
  onMapClick,
  onSelectMarker,
  onZoomMarker,
}: {
  provider: MapProvider;
  mapLibreState: ReturnType<typeof useMapLibreViewState>;
  googleState: ReturnType<typeof useGoogleMapViewState>;
  selectedMarker: MarkerState | null;
  onMapLoaded: () => void;
  onMapClick: () => void;
  onSelectMarker: (marker: MarkerState) => void;
  onZoomMarker: (marker: MarkerState) => void;
}) {
  const overlay = selectedMarker ? (
    <InfoBubble marker={selectedMarker} bubbleColor="#ffffff" borderColor="#ef4444">
      <PostOfficeInfoView
        info={selectedMarker.extra as unknown as PostOfficeExtra}
        marker={selectedMarker}
        onZoom={onZoomMarker}
      />
    </InfoBubble>
  ) : null;
  const markers = <PostOfficeMarkers onSelectMarker={onSelectMarker} />;

  if (provider === 'google-maps') {
    return (
      <GoogleMapView
        state={googleState}
        style={styles.map}
        markerTilingOptions={MARKER_TILING_OPTIONS}
        onMapLoaded={onMapLoaded}
        onMapClick={onMapClick}
      >
        {markers}
        {overlay}
      </GoogleMapView>
    );
  }

  return (
    <MapLibreView
      state={mapLibreState}
      style={styles.map}
      markerTilingOptions={MARKER_TILING_OPTIONS}
      onMapLoaded={onMapLoaded}
      onMapClick={onMapClick}
    >
      {markers}
      {overlay}
    </MapLibreView>
  );
}

export function PostOfficePage({ provider }: { provider: MapProvider }) {
  const [selectedMarker, setSelectedMarker] = useState<MarkerState | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Switching providers remounts the native map view, so the "ready" state
  // must be re-armed for the newly mounted view.
  useEffect(() => {
    setMapReady(false);
  }, [provider]);

  const handleMapLoaded = useCallback(() => {
    setTimeout(() => setMapReady(true), 10000);
  }, []);

  const mapLibreState = useMapLibreViewState({
    id: 'post-office-maplibre',
    mapDesignType: MapLibreDesign.OsmBrightJa,
    cameraPosition: INIT_CAMERA,
  });
  const googleState = useGoogleMapViewState({
    id: 'post-office-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA,
  });

  const handleZoomMarker = useCallback(
    (marker: MarkerState) => {
      const state = provider === 'google-maps' ? googleState : mapLibreState;
      state.moveCameraTo(
        MapCameraPosition.from({
          position: marker.position,
          zoom: 18,
          bearing: 0,
          tilt: 30,
        }),
        2000
      );
    },
    [googleState, mapLibreState, provider]
  );

  return (
    <View style={styles.mapContainer}>
      <PostOfficeMap
        provider={provider}
        mapLibreState={mapLibreState}
        googleState={googleState}
        selectedMarker={selectedMarker}
        onMapLoaded={handleMapLoaded}
        onMapClick={() => setSelectedMarker(null)}
        onSelectMarker={setSelectedMarker}
        onZoomMarker={handleZoomMarker}
      />

      {!mapReady && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>
            郵便局データを読み込み中 ({POST_OFFICES.length.toLocaleString()}件)…
          </Text>
        </View>
      )}

      <View style={styles.controlPanel}>
        <Text style={styles.controlPanelTitle}>Post Office ({POST_OFFICES.length.toLocaleString()}件)</Text>
        <Text style={styles.note}>マーカーをクリックすると郵便局情報が表示されます。</Text>
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  loadingText: {
    marginTop: 12,
    color: '#1f1d26',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBubbleContent: {
    width: 240,
  },
  infoTitle: {
    color: '#1f1d26',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  infoAddress: {
    marginTop: 4,
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
  },
  controlPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    maxWidth: 360,
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
  controlPanelTitle: {
    marginBottom: 8,
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
  },
});
