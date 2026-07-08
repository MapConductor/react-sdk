import React, { useEffect, useMemo, useState } from 'react';
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
} from '@mapconductor/js-sdk-core';
import {
  GoogleMapDesign,
  GoogleMapsView,
  useGoogleMapViewState,
  type GoogleMapDesignType,
} from '@mapconductor/reactnative-for-googlemaps';
import {
  MapLibreDesign,
  MapLibreView,
  useMapLibreViewState,
  type MapLibreMapDesignType,
} from '@mapconductor/reactnative-for-maplibre';

type MapProvider = 'maplibre' | 'google-maps';
type SampleStatus = 'ready' | 'unsupported';

interface MapDesignOption {
  label: string;
  design: MapDesignTypeInterface<unknown>;
}

interface SamplePageDefinition {
  id: string;
  label: string;
  group: string;
  status?: SampleStatus;
}

const INIT_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 21.382314, longitude: -157.933097, altitude: 0 }),
  zoom: 12,
  bearing: 0,
  tilt: 0,
});

const GOOGLE_MAP_2D_DESIGNS: MapDesignOption[] = [
  { label: 'Normal', design: GoogleMapDesign.Normal },
  { label: 'Satellite', design: GoogleMapDesign.Satellite },
  { label: 'Hybrid', design: GoogleMapDesign.Hybrid },
  { label: 'Terrain', design: GoogleMapDesign.Terrain },
  { label: 'None', design: GoogleMapDesign.None },
];

const MAPLIBRE_DESIGNS: MapDesignOption[] = [
  { label: 'DemoTiles', design: MapLibreDesign.DemoTiles },
  { label: 'MapTilerBasicEn', design: MapLibreDesign.MapTilerBasicEn },
  { label: 'MapTilerBasicJa', design: MapLibreDesign.MapTilerBasicJa },
  { label: 'MapTilerTonerEn', design: MapLibreDesign.MapTilerTonerEn },
  { label: 'MapTilerTonerJa', design: MapLibreDesign.MapTilerTonerJa },
  { label: 'OsmBright', design: MapLibreDesign.OsmBright },
  { label: 'OsmBrightEn', design: MapLibreDesign.OsmBrightEn },
  { label: 'OsmBrightJa', design: MapLibreDesign.OsmBrightJa },
  { label: 'OpenMapTiles', design: MapLibreDesign.OpenMapTiles },
];

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

function providerLabel(provider: MapProvider): string {
  return provider === 'google-maps' ? 'Google Maps' : 'MapLibre';
}

function providerDesignOptions(provider: MapProvider): MapDesignOption[] {
  return provider === 'google-maps' ? GOOGLE_MAP_2D_DESIGNS : MAPLIBRE_DESIGNS;
}

function firstDesignId(provider: MapProvider): string {
  return String(providerDesignOptions(provider)[0]?.design.id ?? '');
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
            const isActive = page.id === 'map-design';
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

function DesignMap({
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

export function MapDesignPage() {
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [provider, setProvider] = useState<MapProvider>('maplibre');

  const mapLibreState = useMapLibreViewState({
    id: 'map-design-maplibre',
    mapDesignType: MapLibreDesign.OsmBright,
    cameraPosition: INIT_CAMERA,
  });
  const googleState = useGoogleMapViewState({
    id: 'map-design-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INIT_CAMERA,
  });

  const mapDesignOptions = useMemo(() => providerDesignOptions(provider), [provider]);
  const currentState = provider === 'google-maps' ? googleState : mapLibreState;
  const [selectedDesignId, setSelectedDesignId] = useState(String(mapLibreState.mapDesignType.id));

  useEffect(() => {
    setSelectedDesignId(String(currentState.mapDesignType.id));
  }, [currentState, provider]);

  function handleProviderChange(nextProvider: MapProvider) {
    setProvider(nextProvider);
    setSelectedDesignId(firstDesignId(nextProvider));
  }

  function handleDesignChange(designId: string) {
    const option = mapDesignOptions.find((item) => String(item.design.id) === designId);
    if (!option) return;

    if (provider === 'google-maps') {
      googleState.mapDesignType = option.design as GoogleMapDesignType;
    } else {
      mapLibreState.mapDesignType = option.design as MapLibreMapDesignType;
    }
    setSelectedDesignId(String(option.design.id));
  }

  return (
    <View style={styles.app}>
      <Header
        provider={provider}
        isWide={isWide}
        onProviderChange={handleProviderChange}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      <View style={styles.appBody}>
        {isWide ? <PageNav /> : null}

        <View style={styles.mapContainer}>
          <DesignMap provider={provider} mapLibreState={mapLibreState} googleState={googleState} />

          <View style={styles.mapDesignSelector}>
            <Text style={styles.mapDesignLabel}>Map design</Text>
            <Picker<string>
              selectedValue={selectedDesignId}
              onValueChange={handleDesignChange}
              style={styles.designPicker}
              dropdownIconColor="#111827"
              mode="dropdown"
            >
              {mapDesignOptions.map((option) => (
                <Picker.Item
                  key={String(option.design.id)}
                  label={option.label}
                  value={String(option.design.id)}
                />
              ))}
            </Picker>
            <Text style={styles.providerCaption}>{providerLabel(provider)}</Text>
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
  mapDesignSelector: {
    position: 'absolute',
    left: 16,
    bottom: 20,
    width: 320,
    maxWidth: '92%',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.7)',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#0f172a',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  mapDesignLabel: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  designPicker: {
    height: 38,
    marginHorizontal: -8,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  providerCaption: {
    color: '#64748b',
    fontSize: 11,
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
