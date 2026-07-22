import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  GeoPoint,
  MapCameraPosition,
  createMarkerState,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { InfoBubble, ReactNativeImageIcon } from '@mapconductor/js-sdk-react/native';
import {
  GoogleMapDesign,
  useGoogleMapViewState,
} from '@mapconductor/reactnative-for-googlemaps';
import {
  MapLibreDesign,
  useMapLibreViewState,
} from '@mapconductor/reactnative-for-maplibre';
import {
  MarkerClusterGroup,
  type MarkerCluster,
  type ClusterIconProvider,
} from '@mapconductor/react-marker-clustering';
import { MapViewContainer } from '../../MapViewContainer';
import postOfficesJson from '../../../data/postoffice/postoffices.json';

type MapProvider = 'maplibre' | 'google-maps' | 'here';
type PostOfficeRow = [number, number, string, string];

interface PostOfficeExtra {
  name: string;
  address: string;
}

const POST_OFFICES = postOfficesJson as PostOfficeRow[];
const ANDROID_PACKAGE = 'com.mapconductor.basic';
const POST_OFFICE_ICON_URI = Platform.OS === 'ios'
  ? 'bundle://postoffice'
  : `android.resource://${ANDROID_PACKAGE}/drawable/postoffice`;
const CLUSTER_ICON_URI = Platform.OS === 'ios'
  ? 'bundle://cluster_red'
  : `android.resource://${ANDROID_PACKAGE}/drawable/cluster_red`;

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 35.68049, longitude: 139.76669, altitude: 0 }),
  zoom: 10,
  bearing: 0,
  tilt: 0,
});

const CLUSTER_ICON = new ReactNativeImageIcon(CLUSTER_ICON_URI, { iconSize: 52 });
const CLUSTER_ICON_PROVIDER: ClusterIconProvider = () => CLUSTER_ICON;

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

function ClusteredPostOffices({
  markers,
  debugHullPolygons,
  onClusterClick,
}: {
  markers: MarkerState[];
  debugHullPolygons: boolean;
  onClusterClick: (cluster: MarkerCluster) => void;
}) {
  return (
    <MarkerClusterGroup
      markers={markers}
      clusterIconProvider={CLUSTER_ICON_PROVIDER}
      onClusterClick={onClusterClick}
      minClusterSize={3}
      clusterRadiusPx={80}
      enableZoomAnimation
      enablePanAnimation
      debugHullPolygons={debugHullPolygons}
    />
  );
}

export function PostOfficeClusterPage({ provider }: { provider: MapProvider }) {
  const [selectedMarker, setSelectedMarker] = useState<MarkerState | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [debugHullPolygons, setDebugHullPolygons] = useState(false);

  const mapLibreState = useMapLibreViewState({
    id: 'post-office-cluster-maplibre',
    mapDesignType: MapLibreDesign.OsmBrightJa,
    cameraPosition: INIT_CAMERA,
  });
  const googleState = useGoogleMapViewState({
    id: 'post-office-cluster-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA,
  });

  useEffect(() => {
    setMapReady(false);
    setSelectedMarker(null);
  }, [provider]);

  const icon = useMemo(
    () =>
      new ReactNativeImageIcon(POST_OFFICE_ICON_URI, {
        scale: 0.4,
        infoAnchor: { x: 0.5, y: 0 },
      }),
    []
  );

  const markers = useMemo(
    () =>
      POST_OFFICES.map(([latitude, longitude, name, address], index) =>
        createMarkerState({
          id: `post-office-cluster-${index}`,
          position: GeoPoint.from({ latitude, longitude, altitude: 0 }),
          extra: { name, address } satisfies PostOfficeExtra,
          icon,
          clickable: true,
          onClick: setSelectedMarker,
        })
      ),
    [icon]
  );

  const markerMapRef = useRef(new Map<string, MarkerState>());
  useEffect(() => {
    markerMapRef.current = new Map(markers.map((marker) => [marker.id, marker]));
  }, [markers]);

  const activeMapState = provider === 'google-maps' ? googleState : mapLibreState;

  const handleClusterClick = useCallback(
    (cluster: MarkerCluster) => {
      let latitude = 0;
      let longitude = 0;
      let count = 0;
      for (const markerId of cluster.markerIds) {
        const marker = markerMapRef.current.get(markerId);
        if (!marker) continue;
        latitude += marker.position.latitude;
        longitude += marker.position.longitude;
        count += 1;
      }
      if (count === 0) return;

      activeMapState.moveCameraTo(
        MapCameraPosition.from({
          position: GeoPoint.from({
            latitude: latitude / count,
            longitude: longitude / count,
            altitude: 0,
          }),
          zoom: Math.min((activeMapState.cameraPosition?.zoom ?? 10) + 2, 18),
          bearing: 0,
          tilt: 0,
        }),
        600
      );
    },
    [activeMapState]
  );

  const handleZoomMarker = useCallback(
    (marker: MarkerState) => {
      activeMapState.moveCameraTo(
        MapCameraPosition.from({
          position: marker.position,
          zoom: 18,
          bearing: 0,
          tilt: 30,
        }),
        2000
      );
    },
    [activeMapState]
  );

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer
          state={activeMapState}
          style={styles.map}
          onMapLoaded={() => setMapReady(true)}
          onMapClick={() => setSelectedMarker(null)}>

          {mapReady ? (
            // Waits until map is ready to improve user experience.
            <ClusteredPostOffices
              markers={markers}
              debugHullPolygons={debugHullPolygons}
              onClusterClick={handleClusterClick}
            />
          ) : null}
          {selectedMarker ? (
            <InfoBubble marker={selectedMarker} bubbleColor="#ffffff" borderColor="#ef4444">
              <PostOfficeInfoView
                info={selectedMarker.extra as unknown as PostOfficeExtra}
                marker={selectedMarker}
                onZoom={handleZoomMarker}
              />
            </InfoBubble>
          ) : null}

      </MapViewContainer>
      {!mapReady ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>
            郵便局データを読み込み中 ({POST_OFFICES.length.toLocaleString()}件)…
          </Text>
        </View>
      ) : null}

      <View style={styles.controlPanel}>
        <Text style={styles.controlPanelTitle}>
          Post Office Cluster ({POST_OFFICES.length.toLocaleString()}件)
        </Text>
        <View style={styles.debugRow}>
          <Switch
            value={debugHullPolygons}
            onValueChange={setDebugHullPolygons}
            trackColor={{ false: '#cbd5e1', true: '#fca5a5' }}
            thumbColor={debugHullPolygons ? '#ef4444' : '#f8fafc'}
          />
          <Text style={styles.debugLabel}>debug hull polygons</Text>
        </View>
        <Text style={styles.note}>
          クラスターをクリックするとズームインします。{`\n`}
          個別マーカーをクリックすると郵便局情報が表示されます。
        </Text>
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
    right: 0,
    bottom: 0,
    left: 0,
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
  controlPanelTitle: {
    marginBottom: 8,
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  debugRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  debugLabel: {
    marginLeft: 8,
    color: '#334155',
    fontSize: 13,
  },
  note: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
  },
});
