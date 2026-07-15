import React, { useMemo, useState } from 'react';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { MapScreen } from 'src/screens/MapScreen';

type MapProvider = 'google-maps' | 'maplibre';

export interface SamplePageDefinition {
  id: string;
  label: string;
  group: string;
  status?: 'ready' | 'unsupported';
  showProviderSelector?: boolean;
}

const SAMPLE_PAGES: SamplePageDefinition[] = [
  { id: 'map', label: 'Store Map', group: 'Map' },
  { id: 'map-design', label: 'Map Design', group: 'Map' },
  { id: 'fly-to', label: 'Fly To', group: 'Map' },
  { id: 'tilt', label: 'Tilt', group: 'Map' },
  { id: 'visible-region', label: 'Visible Region', group: 'Map' },
  { id: 'camera-sync', label: 'Camera Sync', group: 'Map', showProviderSelector: false },
  { id: 'marker', label: 'Marker Icons', group: 'Marker', status: 'unsupported' },
  { id: 'marker-animation', label: 'Marker Animation', group: 'Marker' },
  { id: 'post-office', label: 'Post Office', group: 'Marker' },
  { id: 'post-office-cluster', label: 'Post Office Cluster', group: 'Marker' },
  { id: 'circle', label: 'Circle', group: 'Shape' },
  { id: 'polyline', label: 'Polyline', group: 'Shape' },
  { id: 'polyline-click', label: 'Polyline Click', group: 'Shape' },
  { id: 'polygon', label: 'Polygon', group: 'Shape' },
  { id: 'polygon-click', label: 'Polygon Click', group: 'Shape' },
  { id: 'polygon-geodesic', label: 'Polygon Geodesic', group: 'Shape' },
  { id: 'polygon-hole', label: 'Polygon with Holes', group: 'Shape' },
  { id: 'ground-image', label: 'Ground Image', group: 'Overlay' },
  { id: 'raster-layer', label: 'Raster Layer', group: 'Overlay' },
  { id: 'heatmap-layer', label: 'Heatmap Layer', group: 'Extensions' },
];

function Header({
  provider,
  showProviderSelector,
  showTitle,
  onOpenMenu,
  onProviderChange,
}: {
  provider: MapProvider;
  showProviderSelector: boolean;
  showTitle: boolean;
  onOpenMenu: () => void;
  onProviderChange: (provider: MapProvider) => void;
}) {
  const [isProviderMenuOpen, setIsProviderMenuOpen] = useState(false);
  const providerLabel = provider === 'google-maps' ? 'GoogleMapView' : 'MapLibreView';

  const selectProvider = (nextProvider: MapProvider) => {
    onProviderChange(nextProvider);
    setIsProviderMenuOpen(false);
  };

  return (
    <View style={styles.header}>
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

      {showTitle ? (
        <Text style={styles.headerTitle} numberOfLines={1}>
          MapConductor React SDK Samples
        </Text>
      ) : (
        <View style={styles.headerSpacer} />
      )}

      {showProviderSelector ? (
        <>
          <TouchableOpacity
            style={styles.providerControl}
            activeOpacity={0.75}
            onPress={() => setIsProviderMenuOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Map provider"
          >
            <Text style={styles.providerControlText} numberOfLines={1}>
              {providerLabel}
            </Text>
            <Text style={styles.providerChevron}>v</Text>
          </TouchableOpacity>
          <Modal
            visible={isProviderMenuOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setIsProviderMenuOpen(false)}
          >
            <View style={styles.providerMenuRoot}>
              <Pressable style={styles.providerMenuScrim} onPress={() => setIsProviderMenuOpen(false)} />
              <View style={styles.providerMenu}>
                <TouchableOpacity
                  style={[styles.providerMenuItem, provider === 'google-maps' && styles.providerMenuItemActive]}
                  activeOpacity={0.75}
                  onPress={() => selectProvider('google-maps')}
                >
                  <Text
                    style={[
                      styles.providerMenuItemText,
                      provider === 'google-maps' && styles.providerMenuItemTextActive,
                    ]}
                  >
                    GoogleMapView
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.providerMenuItem, provider === 'maplibre' && styles.providerMenuItemActive]}
                  activeOpacity={0.75}
                  onPress={() => selectProvider('maplibre')}
                >
                  <Text
                    style={[
                      styles.providerMenuItemText,
                      provider === 'maplibre' && styles.providerMenuItemTextActive,
                    ]}
                  >
                    MapLibreView
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <View
          style={styles.providerPlaceholder}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Text />
        </View>
      )}
    </View>
  );
}

function Sidebar({ activePageId, onSelectPage }: { activePageId: string; onSelectPage: (pageId: string) => void }) {
  const groups = useMemo(() => Array.from(new Set(SAMPLE_PAGES.map((page) => page.group))), []);
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.sidebar}
      contentContainerStyle={[
        styles.sidebarContent,
        {
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      <Text style={styles.sidebarTitle}>Samples</Text>
      {groups.map((group) => (
        <View key={group} style={styles.sidebarGroup}>
          <Text style={styles.sidebarGroupTitle}>{group}</Text>
          {SAMPLE_PAGES.filter((page) => page.group === group).map((page) => {
            const isActive = page.id === activePageId;
            return (
              <TouchableOpacity
                key={page.id}
                style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                activeOpacity={0.72}
                onPress={() => onSelectPage(page.id)}
              >
                <Text
                  style={[styles.sidebarItemText, isActive && styles.sidebarItemTextActive]}
                  numberOfLines={1}
                >
                  {page.label}
                </Text>
                {page.status === 'unsupported' ? <Text style={styles.sidebarBadge}>TODO</Text> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

export default function App() {
  const { width } = useWindowDimensions();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePageId, setActivePageId] = useState('map');
  const [provider, setProvider] = useState<MapProvider>('google-maps');
  const activePage = SAMPLE_PAGES.find((page) => page.id === activePageId);
  const showProviderSelector = activePage?.showProviderSelector ?? true;
  const showTitle = width >= 430 || !showProviderSelector;

  const selectPage = (pageId: string) => {
    setActivePageId(pageId);
    setIsMenuOpen(false);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" />
        <Header
          provider={provider}
          showProviderSelector={showProviderSelector}
          showTitle={showTitle}
          onOpenMenu={() => setIsMenuOpen(true)}
          onProviderChange={setProvider}
        />

        <View style={styles.body}>
          <View style={styles.content}>
            <MapScreen provider={provider} page={activePage ?? SAMPLE_PAGES[0]} />
          </View>
        </View>

        <Modal
          visible={isMenuOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsMenuOpen(false)}
        >
          <View style={styles.modalRoot}>
            <Pressable style={styles.scrim} onPress={() => setIsMenuOpen(false)} />
            <View style={styles.drawer}>
              <Sidebar activePageId={activePageId} onSelectPage={selectPage} />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d1d5db',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 12,
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    flex: 1,
    minWidth: 8,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  menuLine: {
    width: 18,
    height: 2,
    marginVertical: 2,
    borderRadius: 1,
    backgroundColor: '#111827',
  },
  providerControl: {
    width: 168,
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerControlText: {
    flex: 1,
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  providerChevron: {
    marginLeft: 8,
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
  },
  providerPlaceholder: {
    width: 168,
    height: 48,
  },
  providerMenuRoot: {
    flex: 1,
  },
  providerMenuScrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'transparent',
  },
  providerMenu: {
    position: 'absolute',
    top: 58,
    right: 10,
    width: 184,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  providerMenuItem: {
    minHeight: 40,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  providerMenuItemActive: {
    backgroundColor: '#eff6ff',
  },
  providerMenuItemText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  providerMenuItemTextActive: {
    color: '#1d4ed8',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  sidebar: {
    flex: 1,
    width: 260,
    backgroundColor: '#111827',
  },
  sidebarContent: {
    paddingHorizontal: 14,
  },
  sidebarTitle: {
    marginBottom: 16,
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '700',
  },
  sidebarGroup: {
    marginBottom: 18,
  },
  sidebarGroupTitle: {
    marginBottom: 6,
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sidebarItem: {
    minHeight: 38,
    paddingHorizontal: 10,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sidebarItemActive: {
    backgroundColor: '#2563eb',
  },
  sidebarItemText: {
    flex: 1,
    color: '#e5e7eb',
    fontSize: 14,
  },
  sidebarItemTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  sidebarBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#374151',
    color: '#d1d5db',
    fontSize: 10,
    fontWeight: '700',
  },
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
  },
  drawer: {
    width: 280,
    maxWidth: '82%',
    backgroundColor: '#111827',
  },
});
