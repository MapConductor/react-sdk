import React, { useCallback, useMemo, useState } from 'react';
import {
  Linking,
  Platform,
  StyleSheet,
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
import { InfoBubble, Markers, ReactNativeImageDefaultIcon } from '@mapconductor/js-sdk-react/native';
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

import { STORES, type StoreInfo } from '../../../data/storeData';

type MapProvider = 'maplibre' | 'google-maps';

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 21.382314, longitude: -157.933097, altitude: 0 }),
  zoom: 10,
  bearing: 0,
  tilt: 0,
});

const ANDROID_PACKAGE = 'com.mapconductor.basic';

const STORE_ICON_URIS: Record<string, string> = {
  coffee_bean: `android.resource://${ANDROID_PACKAGE}/drawable/coffee_bean`,
  honolulu_coffee: `android.resource://${ANDROID_PACKAGE}/drawable/honolulu_coffee`,
  coffee_extra: `android.resource://${ANDROID_PACKAGE}/drawable/coffee_extra`,
  starbucks: `android.resource://${ANDROID_PACKAGE}/drawable/starbucks`,
};
function StoreInfoView({ info }: { info: StoreInfo }) {
  const openDirections = () => {
    const destination = encodeURIComponent(info.address);
    void Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
  };

  return (
    <View style={styles.infoBubbleContent}>
      <Text style={styles.infoTitle} numberOfLines={2}>
        {info.name}
      </Text>
      <Text style={styles.infoAddress}>{info.address}</Text>
      {(info.instore || info.driveThrough) && (
        <View style={styles.featureRow}>
          {info.instore ? (
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>In store eating</Text>
            </View>
          ) : null}
          {info.driveThrough ? (
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Drive Through</Text>
            </View>
          ) : null}
        </View>
      )}
      <TouchableOpacity
        style={styles.directionsButton}
        onPress={openDirections}
        activeOpacity={0.75}
      >
        <View style={styles.directionsDot} />
        <Text style={styles.directionsText}>Get Directions</Text>
      </TouchableOpacity>
    </View>
  );
}

function StoreMarkers({ onSelectMarker }: { onSelectMarker: (marker: MarkerState) => void }) {
  const markers = useMemo(
    () =>
      STORES.map(({ lat, lng, ...info }) =>
        createMarkerState({
          id: `${info.store}-${lat}-${lng}`,
          position: GeoPoint.from({ latitude: lat, longitude: lng, altitude: 0 }),
          extra: info,
          icon:
            Platform.OS === 'android'
              ? new ReactNativeImageDefaultIcon(
                  STORE_ICON_URIS[info.store] ?? STORE_ICON_URIS.starbucks,
                  {
                    scale: 1,
                    infoAnchor: { x: 0.5, y: 0 },
                  }
                )
              : null,
          clickable: true,
          draggable: true,
          onClick: onSelectMarker,
        })
      ),
    [onSelectMarker]
  );

  return <Markers states={markers} />;
}

function StoreMap({
  provider,
  mapLibreState,
  googleState,
  onMapClick,
  onSelectMarker,
  selectedMarker,
}: {
  provider: MapProvider;
  mapLibreState: ReturnType<typeof useMapLibreViewState>;
  googleState: ReturnType<typeof useGoogleMapViewState>;
  onMapClick: () => void;
  onSelectMarker: (marker: MarkerState) => void;
  selectedMarker: MarkerState | null;
}) {
  const overlay = selectedMarker ? (
    <InfoBubble marker={selectedMarker} bubbleColor="#ffffff">
      <StoreInfoView info={selectedMarker.extra as StoreInfo} />
    </InfoBubble>
  ) : null;

  if (provider === 'google-maps') {
    return (
      <GoogleMapView state={googleState} style={styles.map} onMapClick={onMapClick}>
        <StoreMarkers onSelectMarker={onSelectMarker} />
        {overlay}
      </GoogleMapView>
    );
  }

  return (
    <MapLibreView state={mapLibreState} style={styles.map} onMapClick={onMapClick}>
      <StoreMarkers onSelectMarker={onSelectMarker} />
      {overlay}
    </MapLibreView>
  );
}

export function MapPage({ provider }: { provider: MapProvider }) {
  const [selectedMarker, setSelectedMarker] = useState<MarkerState | null>(null);
  const handleSelectMarker = useCallback((marker: MarkerState) => {
    setSelectedMarker(marker);
  }, []);

  const mapLibreState = useMapLibreViewState({
    id: 'store-map-maplibre',
    mapDesignType: MapLibreDesign.DemoTiles,
    cameraPosition: INIT_CAMERA,
  });
  const googleState = useGoogleMapViewState({
    id: 'store-map-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA,
  });

  return (
    <View style={styles.mapContainer}>
      <StoreMap
        provider={provider}
        mapLibreState={mapLibreState}
        googleState={googleState}
        onMapClick={() => setSelectedMarker(null)}
        onSelectMarker={handleSelectMarker}
        selectedMarker={selectedMarker}
      />
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
  infoBubbleContent: {
    width: 300,
  },
  infoTitle: {
    color: '#1f1d26',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  infoAddress: {
    marginTop: 4,
    color: '#1f1d26',
    fontSize: 13,
    lineHeight: 20,
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#1f1d26',
  },
  featureText: {
    color: '#1f1d26',
    fontSize: 14,
    lineHeight: 20,
  },
  directionsButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    borderRadius: 20,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  directionsDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#111827',
  },
  directionsText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  drawerRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerScrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  drawer: {
    width: 300,
    maxWidth: '82%',
    backgroundColor: '#ffffff',
  },
});
