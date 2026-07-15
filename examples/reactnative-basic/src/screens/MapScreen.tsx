import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SamplePageDefinition } from '../../App';
import { MapPage } from 'src/pages/map/basic/StoreMapPage';
import { CameraSyncPage } from 'src/pages/map/camerasync/CameraSyncPage';
import { MapDesignPage, type MapProvider } from 'src/pages/map/design/MapDesignPage';
import { FlyToPage } from 'src/pages/map/flyto/FlyToPage';
import { TiltPage } from 'src/pages/map/tilt/TiltPage';
import { VisibleRegionPage } from 'src/pages/map/visibleregion/VisibleRegionPage';
import { HeatmapLayerPage } from 'src/pages/heatmaplayer/HeatmapLayerPage';
import { RasterLayerPage } from 'src/pages/rasterlayer/RasterLayerPage';
import { MarkerAnimationPage } from 'src/pages/marker/animation/MarkerAnimationPage';
import { PostOfficePage } from 'src/pages/marker/postoffice/PostOfficePage';
import { PostOfficeClusterPage } from 'src/pages/marker/postofficecluster/PostOfficeClusterPage';
import { PolylinePage } from 'src/pages/polyline/PolylinePage';
import { PolygonPage } from 'src/pages/polygon/PolygonPage';
import { CirclePage } from 'src/pages/circle/CirclePage';

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
    case 'tilt':
      return <TiltPage provider={provider} />;
    case 'visible-region':
      return <VisibleRegionPage provider={provider} />;
    case 'camera-sync':
      return <CameraSyncPage />;
    case 'marker-animation':
      return <MarkerAnimationPage provider={provider} />;
    case 'post-office':
      return <PostOfficePage provider={provider} />;
    case 'post-office-cluster':
      return <PostOfficeClusterPage provider={provider} />;
    case 'circle':
      return <CirclePage provider={provider} />;
    case 'polyline':
      return <PolylinePage provider={provider} />;
    case 'polygon':
      return <PolygonPage provider={provider} />;
    case 'heatmap-layer':
      return <HeatmapLayerPage provider={provider} />;
    case 'raster-layer':
      return <RasterLayerPage provider={provider} />;
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
