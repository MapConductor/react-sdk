import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Asset } from 'expo-asset';

import {
  GeoPoint,
  MapCameraPosition,
  createMarkerState,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import {
  InfoBubble,
  Markers,
  ReactNativeImageDefaultIcon,
} from '@mapconductor/js-sdk-react/native';

import { STORES, type StoreInfo } from '../../../data/storeData';
import { MapViewContainer } from '../../MapViewContainer';
import type { MapProvider } from '../../../providers/types';

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 21.382314, longitude: -157.933097, altitude: 0 }),
  zoom: 10,
  bearing: 0,
  tilt: 0,
});

const STORE_ICON_ASSETS: Record<string, number> = {
  coffee_bean: require('../../../../assets/images/coffee_bean.png'),
  honolulu_coffee: require('../../../../assets/images/honolulu_coffee.png'),
  coffee_extra: require('../../../../assets/images/coffee_extra.png'),
  starbucks: require('../../../../assets/images/starbucks.png'),
};

function useStoreIconUris(): Record<string, string> | null {
  const [uris, setUris] = useState<Record<string, string> | null>(() =>
    Platform.OS === 'ios'
      ? Object.fromEntries(
          Object.keys(STORE_ICON_ASSETS).map(name => [name, `bundle://${name}`])
        )
      : null
  );

  useEffect(() => {
    if (Platform.OS === 'ios') return;

    let active = true;
    const entries = Object.entries(STORE_ICON_ASSETS);

    void Asset.loadAsync(entries.map(([, source]) => source))
      .then((assets) => {
        if (!active) return;
        setUris(Object.fromEntries(
          assets.map((asset, index) => [entries[index][0], asset.localUri ?? asset.uri])
        ));
      })
      .catch((error: unknown) => {
        console.warn('Failed to load store marker icons', error);
      });

    return () => {
      active = false;
    };
  }, []);

  return uris;
}

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
  const iconUris = useStoreIconUris();
  const markers = useMemo(
    () => {
      if (!iconUris) return [];
      return STORES.map(({ lat, lng, ...info }) =>
        createMarkerState({
          id: `${info.store}-${lat}-${lng}`,
          position: GeoPoint.from({ latitude: lat, longitude: lng, altitude: 0 }),
          extra: info,
          icon: new ReactNativeImageDefaultIcon(
            iconUris[info.store] ?? iconUris.starbucks,
            {
              scale: 1,
              infoAnchor: { x: 0.5, y: 0 },
            }
          ),
          clickable: true,
          draggable: true,
          onClick: onSelectMarker,
        })
      );
    },
    [iconUris, onSelectMarker]
  );

  return <Markers states={markers} />;
}

function StoreMap({
  provider,
  onMapClick,
  onSelectMarker,
  selectedMarker,
}: {
  provider: MapProvider;
  onMapClick: () => void;
  onSelectMarker: (marker: MarkerState) => void;
  selectedMarker: MarkerState | null;
}) {
  const overlay = selectedMarker ? (
    <InfoBubble marker={selectedMarker} bubbleColor="#ffffff">
      <StoreInfoView info={selectedMarker.extra as StoreInfo} />
    </InfoBubble>
  ) : null;

  return (
    <MapViewContainer
      provider={provider}
      cameraPosition={INIT_CAMERA}
      mapId="store-map"
      style={styles.map}
      onMapClick={onMapClick}
    >
      <StoreMarkers onSelectMarker={onSelectMarker} />
      {overlay}
    </MapViewContainer>
  );
}

export function MapPage({ provider }: { provider: MapProvider }) {
  const [selectedMarker, setSelectedMarker] = useState<MarkerState | null>(null);
  const handleSelectMarker = useCallback((marker: MarkerState) => {
    setSelectedMarker(marker);
  }, []);

  return (
    <View style={styles.mapContainer}>
      <StoreMap
        provider={provider}
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
