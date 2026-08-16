import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  NativeModules,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GeoPoint } from '@mapconductor/js-sdk-core';
import { InfoBubble } from '@mapconductor/js-sdk-react/native';
import { GeoJSONLayer, GeoJSONLayerState, type GeoJSONFeatureData } from '@mapconductor/react-geojson';
import type { MapProvider } from '../../../providers/types';
import { MapViewContainer } from '../../MapViewContainer';
import { loadGeoJSONZipAsset } from '../loadGeoJSONZip';
import {
  LAYER_INIT_CAMERA,
  GEOJSON_DESIGN_TYPES,
} from '../geojsonShared';

const GEOJSON_ZIP_ASSET = require('../../../../assets/geojson/N02-22_GML.zip');
const GEOJSON_ZIP_NAME = 'N02-22_GML.zip';

export function GeoJSONLayerPage({ provider }: { provider: MapProvider }) {
  const [sourceUri, setSourceUri] = useState<string | null>(null);
  const [isSourceLoading, setIsSourceLoading] = useState(true);
  const [isLayerLoading, setIsLayerLoading] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeatureData | null>(null);
  const [tappedPosition, setTappedPosition] = useState<GeoPoint | null>(null);

  const layerState = useMemo(
    () =>
      new GeoJSONLayerState({
        strokeColor: 0x7ffa241d,
        strokeWidth: 6,
        styleProviderId: 'example-n02-route',
        onLoadStart: () => setIsLayerLoading(true),
        onLoadComplete: () => setIsLayerLoading(false),
        onClick: (feature, position) => {
          setSelectedFeature(feature);
          setTappedPosition(GeoPoint.from(position));
        },
      }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    setIsSourceLoading(true);
    setSelectedFeature(null);
    setTappedPosition(null);
    void loadGeoJSONZipAsset(GEOJSON_ZIP_ASSET)
      .then((uri) => {
        if (!cancelled) setSourceUri(uri);
      })
      .finally(() => {
        if (!cancelled) setIsSourceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.mapContainer}>
      <MapViewContainer
        provider={provider}
        cameraPosition={LAYER_INIT_CAMERA}
        mapId="geojson-layer"
        style={styles.map}
        designTypes={GEOJSON_DESIGN_TYPES}
        onMapClick={() => {
          setSelectedFeature(null);
          setTappedPosition(null);
        }}
      >
        {sourceUri ? <GeoJSONLayer state={layerState} sourceUri={sourceUri} /> : null}
        {tappedPosition && selectedFeature ? (
          <InfoBubble position={tappedPosition}>
            <PropertyTable properties={selectedFeature.properties} />
          </InfoBubble>
        ) : null}
      </MapViewContainer>

      {isSourceLoading || isLayerLoading ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>
            {isSourceLoading
              ? `Copying ${GEOJSON_ZIP_NAME}...`
              : `Parsing ${GEOJSON_ZIP_NAME}...`}
          </Text>
        </View>
      ) : null}

      <View style={styles.controlPanel}>
        <Text style={styles.title}>GeoJSON Layer</Text>
        <Text style={styles.note}>タップした feature の properties を InfoBubble に表示します。</Text>
      </View>
    </View>
  );
}

/**
 * 国土数値情報の鉄道データ（N02）の属性名。
 *
 * 生の `N02_001` のままだと何の値か分からないので、吹き出しでは名前に置き換える。
 * examples/basic（web）/ android / ios と**同じ文言**にしてある。
 *
 * ここに無いキーは生のキー名をそのまま出す。データ側に属性が増えても表から消えないように。
 */
const propertyLabels: Record<string, { ja: string; en: string }> = {
  N02_001: { ja: '鉄道区分', en: 'Railway category' },
  N02_002: { ja: '事業者区分', en: 'Business category' },
  N02_003: { ja: '路線名', en: 'Railway name' },
  N02_004: { ja: '運営会社', en: 'Railway company' },
};

/**
 * 値の英語表記が入っている属性の接尾辞。
 *
 * geojson 側が `N02_003`（路線名）に対して `N02_003_en` を持っている。アプリに
 * 対訳表を置くと 4 プラットフォーム分そろえる羽目になるので、データに持たせてある。
 */
const ENGLISH_SUFFIX = '_en';

/** 端末の言語。`react-native-localize` を足さずに済ませるため NativeModules から取る。 */
function isJapaneseDevice(): boolean {
  const settings = NativeModules.SettingsManager?.settings;
  const locale: unknown =
    settings?.AppleLocale ?? settings?.AppleLanguages?.[0] ?? NativeModules.I18nManager?.localeIdentifier;
  return typeof locale === 'string' && locale.startsWith('ja');
}

/**
 * 端末の言語が日本語なら日本語、それ以外は英語で出す。
 * 英語のときは値も `N02_003_en` の側へ差し替え、`_en` の行そのものは出さない
 * （同じ項目が 2 行に増えてしまうため）。
 */
function PropertyTable({ properties }: { properties: Readonly<Record<string, unknown>> }) {
  const ja = isJapaneseDevice();
  const entries = Object.entries(properties).filter(([key]) => !key.endsWith(ENGLISH_SUFFIX));

  return (
    <View style={styles.tableShell}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableCell, styles.tableHeaderText, styles.keyCell]}>
          {ja ? 'プロパティ' : 'Property'}
        </Text>
        <Text style={[styles.tableCell, styles.tableHeaderText, styles.valueCell]}>{ja ? '値' : 'Value'}</Text>
      </View>
      <ScrollView style={styles.tableScroll} nestedScrollEnabled>
        {entries.map(([key, value]) => (
          <View key={key} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.keyCell]}>
              {(ja ? propertyLabels[key]?.ja : propertyLabels[key]?.en) ?? key}
            </Text>
            <Text style={[styles.tableCell, styles.valueCell]}>
              {formatPropertyValue(ja ? value : properties[key + ENGLISH_SUFFIX] ?? value)}
            </Text>
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
    width: '50%',
  },
  valueCell: {
    width: '50%',
  },
});
