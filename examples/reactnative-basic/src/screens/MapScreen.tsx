import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SamplePageDefinition } from '../../App';
import { MapPage } from 'src/pages/map/basic/StoreMapPage';
import { CameraSyncPage } from 'src/pages/map/camerasync/CameraSyncPage';
import { MapDesignPage, type MapProvider } from 'src/pages/map/design/MapDesignPage';
import { FlyToPage } from 'src/pages/map/flyto/FlyToPage';
import { VisibleRegionPage } from 'src/pages/map/visibleregion/VisibleRegionPage';
import { MarkerAnimationPage } from 'src/pages/marker/animation/MarkerAnimationPage';

export type { MapProvider };

function UnsupportedPage({ page }: { page: SamplePageDefinition }) {
  return (
    <View style={styles.unsupportedRoot}>
      <View style={styles.unsupportedPanel}>
        <Text style={styles.unsupportedGroup}>{page.group}</Text>
        <Text style={styles.unsupportedTitle}>{page.label}</Text>
        <Text style={styles.unsupportedText}>This sample is not implemented yet.</Text>
      </View>
    </View>
  );
}

export function MapScreen({ provider, page }: { provider: MapProvider; page: SamplePageDefinition }) {
  switch (page.id) {
    case 'map':
      return <MapPage provider={provider} />;
    case 'map-design':
      return <MapDesignPage provider={provider} />;
    case 'fly-to':
      return <FlyToPage provider={provider} />;
    case 'visible-region':
      return <VisibleRegionPage provider={provider} />;
    case 'camera-sync':
      return <CameraSyncPage />;
    case 'marker-animation':
      return <MarkerAnimationPage provider={provider} />;
    default:
      return <UnsupportedPage page={page} />;
  }
}

const styles = StyleSheet.create({
  unsupportedRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f3f4f6',
  },
  unsupportedPanel: {
    width: '100%',
    maxWidth: 420,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  unsupportedGroup: {
    marginBottom: 6,
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  unsupportedTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
  },
  unsupportedText: {
    marginTop: 10,
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
});
