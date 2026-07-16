import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GeoPoint } from '@mapconductor/js-sdk-core';
import { InfoBubbleAtPosition } from '@mapconductor/js-sdk-react/native';
import { GeoJSONLayer, GeoJSONLayerState, type GeoJSONFeatureData } from '@mapconductor/react-geojson-layer';
import type { MapProvider } from '../../../screens/MapScreen';
import { MapViewContainer } from '../../MapViewContainer';
import { loadGeoJSONZipAsset } from '../loadGeoJSONZip';
import {
  LAYER_INIT_CAMERA,
  resolveGeoJSONMapState,
  useGeoJSONMapStates,
} from '../geojsonShared';

const GEOJSON_ZIP_ASSET = require('../../../../assets/geojson/N02-22_GML.zip');
const GEOJSON_ZIP_NAME = 'N02-22_GML.zip';

export function GeoJSONLayerPage({ provider }: { provider: MapProvider }) {
  const states = useGeoJSONMapStates('geojson-layer', LAYER_INIT_CAMERA);
  const state = resolveGeoJSONMapState(provider, states);
  const [sourceUri, setSourceUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeatureData | null>(null);
  const [tappedPosition, setTappedPosition] = useState<GeoPoint | null>(null);

  const layerState = useMemo(
    () =>
      new GeoJSONLayerState({
        strokeColor: 0x7ffa241d,
        strokeWidth: 6,
        onClick: (feature, position) => {
          setSelectedFeature(feature);
          setTappedPosition(GeoPoint.from(position));
        },
      }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSelectedFeature(null);
    setTappedPosition(null);
    void loadGeoJSONZipAsset(GEOJSON_ZIP_ASSET)
      .then((uri) => {
        if (!cancelled) setSourceUri(uri);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer
        state={state}
        style={styles.map}
        onMapClick={() => {
          setSelectedFeature(null);
          setTappedPosition(null);
        }}
      >
        {sourceUri ? <GeoJSONLayer state={layerState} sourceUri={sourceUri} /> : null}
        {tappedPosition && selectedFeature ? (
          <InfoBubbleAtPosition position={tappedPosition}>
            <PropertyTable properties={selectedFeature.properties} />
          </InfoBubbleAtPosition>
        ) : null}
      </MapViewContainer>

      {loading ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Parsing {GEOJSON_ZIP_NAME}...</Text>
        </View>
      ) : null}

      <View style={styles.controlPanel}>
        <Text style={styles.title}>GeoJSON Layer</Text>
        <Text style={styles.note}>タップした feature の properties を InfoBubble に表示します。</Text>
      </View>
    </View>
  );
}

function PropertyTable({ properties }: { properties: Readonly<Record<string, unknown>> }) {
  const entries = Object.entries(properties);

  return (
    <View style={styles.tableShell}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableCell, styles.tableHeaderText, styles.keyCell]}>Property</Text>
        <Text style={[styles.tableCell, styles.tableHeaderText, styles.valueCell]}>Value</Text>
      </View>
      <ScrollView style={styles.tableScroll} nestedScrollEnabled>
        {entries.map(([key, value]) => (
          <View key={key} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.keyCell]}>{key}</Text>
            <Text style={[styles.tableCell, styles.valueCell]}>{formatPropertyValue(value)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function formatPropertyValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
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
  title: {
    marginBottom: 8,
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  note: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
  },
  tableShell: {
    width: 320,
    maxHeight: 260,
    backgroundColor: '#ffffff',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
  },
  tableScroll: {
    maxHeight: 216,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#94a3b8',
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: '#111827',
    fontSize: 12,
  },
  tableHeaderText: {
    fontWeight: '700',
  },
  keyCell: {
    width: '36%',
  },
  valueCell: {
    width: '64%',
  },
});
