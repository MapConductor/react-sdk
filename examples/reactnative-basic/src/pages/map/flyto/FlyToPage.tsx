import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

import {
  GeoPoint,
  MapCameraPosition,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
} from '@mapconductor/js-sdk-core';
import {
  GoogleMapDesign,
  GoogleMapsView,
  useGoogleMapViewState,
} from '@mapconductor/reactnative-for-googlemaps';
import {
  MapLibreDesign,
  MapLibreView,
  useMapLibreViewState,
} from '@mapconductor/reactnative-for-maplibre';

type MapProvider = 'maplibre' | 'google-maps';
type SampleStatus = 'ready' | 'unsupported';

interface SamplePageDefinition {
  id: string;
  label: string;
  group: string;
  status?: SampleStatus;
}

interface CityLocation {
  id: string;
  label: string;
  position: GeoPoint;
}

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 35.0, longitude: 0.0, altitude: 0 }),
  zoom: 3,
  bearing: 0,
  tilt: 0,
});

const FLY_TO_DURATION_MS = 1600;

const SAMPLE_PAGES: SamplePageDefinition[] = [
  { id: 'map', label: 'Store Map', group: 'Map' },
  { id: 'map-design', label: 'Map Design', group: 'Map' },
  { id: 'fly-to', label: 'Fly To', group: 'Map' },
  { id: 'tilt', label: 'Tilt', group: 'Map' },
  { id: 'visible-region', label: 'Visible Region', group: 'Map' },
  { id: 'camera-sync', label: 'Camera Sync', group: 'Map' },
  { id: 'marker', label: 'Marker Icons', group: 'Marker' },
  { id: 'marker-animation', label: 'Marker Animation', group: 'Marker' },
  { id: 'post-office', label: 'Post Office', group: 'Marker' },
  { id: 'post-office-cluster', label: 'Post Office Cluster', group: 'Marker' },
  { id: 'circle', label: 'Circle', group: 'Shape' },
  { id: 'polyline', label: 'Polyline', group: 'Shape' },
  { id: 'polyline-click', label: 'Polyline Click', group: 'Shape' },
  { id: 'polygon', label: 'Polygon', group: 'Shape' },
  { id: 'polygon-click', label: 'Polygon Click', group: 'Shape' },
  { id: 'polygon-geodesic', label: 'Polygon Geodesic', group: 'Shape' },
  { id: 'polygon-hole', label: 'Polygon Hole', group: 'Shape' },
  { id: 'ground-image', label: 'Ground Image', group: 'Overlay' },
  { id: 'raster-layer', label: 'Raster Layer', group: 'Overlay' },
  { id: 'info-bubble-simple', label: 'Simple Bubble', group: 'Info Bubble' },
  { id: 'info-bubble-styled', label: 'Styled Bubble', group: 'Info Bubble' },
  { id: 'info-bubble-multiple', label: 'Multiple Bubbles', group: 'Info Bubble' },
  { id: 'info-bubble-rich', label: 'Rich Bubble', group: 'Info Bubble' },
  { id: 'geojson-basic', label: 'GeoJSON Basic', group: 'Extensions' },
  { id: 'geojson-layer', label: 'GeoJSON Layer', group: 'Extensions' },
  { id: 'heatmap-layer', label: 'Heatmap Layer', group: 'Extensions' },
];

function createCityLocations(): CityLocation[] {
  return [
    {
      id: 'tokyo',
      label: 'Tokyo',
      position: GeoPoint.from({ latitude: 35.6812, longitude: 139.7671, altitude: 0 }),
    },
    {
      id: 'sapporo',
      label: 'Sapporo',
      position: GeoPoint.from({ latitude: 43.0642, longitude: 141.3469, altitude: 0 }),
    },
    {
      id: 'honolulu',
      label: 'Honolulu',
      position: GeoPoint.from({ latitude: 21.3069, longitude: -157.8583, altitude: 0 }),
    },
    {
      id: 'new-york',
      label: 'NY',
      position: GeoPoint.from({ latitude: 40.7128, longitude: -74.006, altitude: 0 }),
    },
  ];
}

function PageNav({ onNavigate }: { onNavigate?: () => void }) {
  const groups = useMemo(() => Array.from(new Set(SAMPLE_PAGES.map((page) => page.group))), []);

  return (
    <ScrollView style={styles.sidebar} contentContainerStyle={styles.sidebarContent}>
      <Text style={styles.sidebarTitle}>Samples</Text>
      {groups.map((group) => (
        <View key={group} style={styles.sidebarGroup}>
          <Text style={styles.sidebarGroupTitle}>{group}</Text>
          {SAMPLE_PAGES.filter((page) => page.group === group).map((page) => {
            const isActive = page.id === 'fly-to';
            return (
              <TouchableOpacity
                key={page.id}
                style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                activeOpacity={0.72}
                onPress={onNavigate}
              >
                <Text
                  style={[styles.sidebarItemText, isActive && styles.sidebarItemTextActive]}
                  numberOfLines={1}
                >
                  {page.label}
                </Text>
                {page.status === 'unsupported' ? (
                  <Text style={styles.sidebarBadge}>TODO</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

function Header({
  provider,
  isWide,
  onProviderChange,
  onOpenMenu,
}: {
  provider: MapProvider;
  isWide: boolean;
  onProviderChange: (provider: MapProvider) => void;
  onOpenMenu: () => void;
}) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle} numberOfLines={1}>
        MapConductor React SDK Samples
      </Text>
      <View style={styles.headerControls}>
        {!isWide ? (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onOpenMenu}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Open samples menu"
          >
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.providerControl}>
          <Text style={styles.providerControlLabel}>Provider</Text>
          <Picker<MapProvider>
            selectedValue={provider}
            onValueChange={(value) => onProviderChange(value)}
            style={styles.headerPicker}
            dropdownIconColor="#f8fafc"
            mode="dropdown"
          >
            <Picker.Item label="MapLibre" value="maplibre" />
            <Picker.Item label="Google Maps" value="google-maps" />
          </Picker>
        </View>
      </View>
    </View>
  );
}

function FlyToMap({
  provider,
  mapLibreState,
  googleState,
}: {
  provider: MapProvider;
  mapLibreState: ReturnType<typeof useMapLibreViewState>;
  googleState: ReturnType<typeof useGoogleMapViewState>;
}) {
  if (provider === 'google-maps') {
    return <GoogleMapsView state={googleState} style={styles.map} />;
  }

  return <MapLibreView state={mapLibreState} style={styles.map} />;
}

function flyToCity(
  city: CityLocation,
  mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>>
) {
  mapViewState.moveCameraTo(
    MapCameraPosition.from({
      position: city.position,
      zoom: 13,
      bearing: 0,
      tilt: 0,
    }),
    FLY_TO_DURATION_MS
  );
}

export function FlyToPage() {
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [provider, setProvider] = useState<MapProvider>('maplibre');
  const cities = useMemo(createCityLocations, []);

  const mapLibreState = useMapLibreViewState({
    id: 'fly-to-maplibre',
    mapDesignType: MapLibreDesign.OsmBright,
    cameraPosition: INIT_CAMERA,
  });
  const googleState = useGoogleMapViewState({
    id: 'fly-to-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA,
  });

  const currentState = (
    provider === 'google-maps' ? googleState : mapLibreState
  ) as MapViewStateInterface<MapDesignTypeInterface<unknown>>;

  return (
    <View style={styles.app}>
      <Header
        provider={provider}
        isWide={isWide}
        onProviderChange={setProvider}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      <View style={styles.appBody}>
        {isWide ? <PageNav /> : null}

        <View style={styles.mapContainer}>
          <FlyToMap provider={provider} mapLibreState={mapLibreState} googleState={googleState} />

          <View style={styles.controlPanel}>
            <Text style={styles.controlPanelTitle}>Fly To</Text>
            <View style={styles.buttonGrid}>
              {cities.map((city) => (
                <TouchableOpacity
                  key={city.id}
                  style={styles.cityButton}
                  activeOpacity={0.75}
                  onPress={() => flyToCity(city, currentState)}
                >
                  <Text style={styles.cityButtonText} numberOfLines={1}>
                    {city.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      <Modal
        visible={!isWide && isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <View style={styles.drawerRoot}>
          <Pressable style={styles.drawerScrim} onPress={() => setIsMenuOpen(false)} />
          <View style={styles.drawer}>
            <PageNav onNavigate={() => setIsMenuOpen(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#f7f8fb',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0,
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 4,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  menuLine: {
    width: 18,
    height: 2,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
  },
  providerControl: {
    width: 158,
    gap: 2,
  },
  providerControlLabel: {
    color: '#cbd5e1',
    fontSize: 11,
  },
  headerPicker: {
    height: 38,
    marginHorizontal: -8,
    color: '#f8fafc',
    backgroundColor: '#0f172a',
  },
  appBody: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'row',
  },
  sidebar: {
    width: 260,
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: '#ffffff',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#d9dde7',
  },
  sidebarContent: {
    padding: 12,
    paddingBottom: 22,
  },
  sidebarTitle: {
    marginBottom: 12,
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sidebarGroup: {
    marginBottom: 14,
  },
  sidebarGroupTitle: {
    marginBottom: 5,
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sidebarItem: {
    minHeight: 34,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sidebarItemActive: {
    borderColor: '#b9d2ff',
    backgroundColor: '#e0ecff',
  },
  sidebarItemText: {
    flex: 1,
    color: '#1f2937',
    fontSize: 14,
  },
  sidebarItemTextActive: {
    color: '#174ea6',
  },
  sidebarBadge: {
    marginLeft: 8,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
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
    maxWidth: 340,
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
    marginBottom: 12,
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cityButton: {
    width: '48%',
    minHeight: 32,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  cityButtonText: {
    color: '#1f2937',
    fontSize: 14,
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
