import { useCallback, useMemo, useState, useEffect } from 'react';
import { ZipReaderStream } from '@zip.js/zip.js';
import { createGeoPoint, type GeoPoint } from '@mapconductor/js-sdk-core';
import { InfoBubbleAtPosition } from '@mapconductor/js-sdk-react';
import {
  GeoJSONLayer,
  GeoJSONLayerState,
  GeoJSONParser,
  colorArgb,
} from '@mapconductor/react-geojson-layer';
import type { GeoJSONFeatureData } from '@mapconductor/react-geojson-layer';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';

const INIT_CAMERA = { lat: 35.68, lng: 139.77, zoom: 13 };

const GEOJSON_ASSET = 'geojson/N02-22_GML.zip';

interface SelectedFeature {
  position: GeoPoint;
  properties: Record<string, unknown>;
}

const PROPERTY_LABELS: Record<string, string> = {
  N02_001: '鉄道区分',
  N02_002: '事業者種別',
  N02_003: '路線名',
  N02_004: '運営会社',
};

interface RailroadStyleEntry {
  company: {
    name: string;
    lines: Array<{ name: string; color: string }>;
  };
}

export function GeoJSONLayerPage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const [features, setFeatures] = useState<GeoJSONFeatureData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedFeature | null>(null);

  const layerState = useMemo(
    () =>
      new GeoJSONLayerState({
        strokeColor: colorArgb(200, 250, 36, 29),
        strokeWidth: 6,
        onLoadStart: () => setIsLoading(true),
        onLoadComplete: (loadError) => {
          setIsLoading(false);
          setError(loadError?.message ?? null);
        },
        onClick: (feature, position) => {
          setSelected({
            position: createGeoPoint({ latitude: position.latitude, longitude: position.longitude }),
            properties: feature.properties ?? {},
          });
        },
      }),
    [],
  );

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      layerState.onLoadStart?.();
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}${GEOJSON_ASSET}`, {
          signal: abort.signal,
        });
        if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);
        const archive = await readGeoJSONArchive(response.body);
        if (abort.signal.aborted) return;
        const parsedFeatures = GeoJSONParser.parseFeatures(archive.geoJSON);
        if (parsedFeatures.length === 0) throw new Error('No GeoJSON features found');
        setFeatures(applyRailroadStyles(parsedFeatures, archive.styles));
        layerState.onLoadComplete?.(null);
      } catch (err) {
        if (!abort.signal.aborted) {
          const loadError = err instanceof Error ? err : new Error(String(err));
          layerState.onLoadComplete?.(loadError);
        }
      }
    })();
  }, [layerState]);

  const handleMapClick = useCallback(
    (point: GeoPoint) => {
      const zoom = mapViewState.cameraPosition.zoom;
      if (!layerState.processClick(point, 10, zoom)) {
        setSelected(null);
      }
    },
    [layerState, mapViewState],
  );

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>データの読み込みに失敗しました: {error}</p>
      </div>
    );
  }

  return (
    <MapViewContainer state={mapViewState} onMapClick={handleMapClick}>
      <GeoJSONLayer state={layerState} features={features} />

      {selected && (
        <InfoBubbleAtPosition position={selected.position}>
          <PropertyTable properties={selected.properties} />
        </InfoBubbleAtPosition>
      )}

      <ControlPanel title="GeoJSON Layer">
        {isLoading ? (
          <p className="control-panel-note">GeoJSON 読み込み中...</p>
        ) : (
          <p className="control-panel-note">
            路線をタップするとプロパティが表示されます。
          </p>
        )}
      </ControlPanel>
    </MapViewContainer>
  );
}

async function readGeoJSONArchive(stream: ReadableStream<Uint8Array>): Promise<{
  geoJSON: string;
  styles: RailroadStyleEntry[];
}> {
  const entries = stream.pipeThrough(new ZipReaderStream()).getReader();
  let geoJSON: string | null = null;
  let styleJSON: string | null = null;
  try {
    for (;;) {
      const { done, value: entry } = await entries.read();
      if (done) break;
      if (!entry.readable) continue;

      const filename = entry.filename.toLowerCase();
      const isUsableFile = !entry.directory && !entry.filename.startsWith('__MACOSX/');
      if (isUsableFile && filename.endsWith('railroadsection.geojson')) {
        geoJSON = await new Response(entry.readable).text();
      } else if (isUsableFile && filename.endsWith('railroadsection.style.json')) {
        styleJSON = await new Response(entry.readable).text();
      } else {
        // Every skipped entry must be consumed before ZipReaderStream can advance.
        await new Response(entry.readable).arrayBuffer();
      }
    }
  } finally {
    await entries.cancel().catch(() => {});
  }

  if (geoJSON == null) throw new Error('No RailroadSection.geojson entry found in zip');
  if (styleJSON == null) throw new Error('No RailroadSection.style.json entry found in zip');
  const styles: unknown = JSON.parse(styleJSON);
  if (!Array.isArray(styles)) throw new Error('Railroad style JSON must be an array');
  return { geoJSON, styles: styles as RailroadStyleEntry[] };
}

function applyRailroadStyles(
  features: GeoJSONFeatureData[],
  styles: RailroadStyleEntry[],
): GeoJSONFeatureData[] {
  const routeColors = new Map<string, number>();
  for (const entry of styles) {
    const company = entry.company;
    if (!company || typeof company.name !== 'string' || !Array.isArray(company.lines)) continue;
    for (const line of company.lines) {
      const color = parseHexColor(line.color);
      if (typeof line.name === 'string' && color != null) {
        routeColors.set(routeKey(company.name, line.name), color);
      }
    }
  }

  return features.map((feature) => {
    const companyName = feature.properties.N02_004;
    const lineName = feature.properties.N02_003;
    if (typeof companyName !== 'string' || typeof lineName !== 'string') return feature;
    const strokeColor = routeColors.get(routeKey(companyName, lineName));
    return strokeColor == null ? feature : { ...feature, strokeColor };
  });
}

function routeKey(companyName: string, lineName: string): string {
  return `${companyName}\u0000${lineName}`;
}

function parseHexColor(value: unknown): number | null {
  if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value)) return null;
  const rgb = Number.parseInt(value.slice(1), 16);
  return colorArgb(255, (rgb >>> 16) & 0xff, (rgb >>> 8) & 0xff, rgb & 0xff);
}

function PropertyTable({ properties }: { properties: Record<string, unknown> }) {
  const entries = Object.entries(properties);
  if (entries.length === 0) return <p style={{ margin: 0, fontSize: 13 }}>プロパティなし</p>;

  return (
    <table style={{ borderCollapse: 'collapse', fontSize: 13, minWidth: 220 }}>
      <thead>
        <tr style={{ background: '#e0e0e0' }}>
          <th style={thStyle}>プロパティ</th>
          <th style={thStyle}>値</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(([key, value]) => (
          <tr key={key}>
            <td style={tdStyle}>{PROPERTY_LABELS[key] ?? key}</td>
            <td style={tdStyle}>{value == null ? '' : String(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const thStyle: React.CSSProperties = {
  border: '1px solid #bbb',
  padding: '4px 8px',
  textAlign: 'left',
  fontWeight: 600,
  color: '#333',
};

const tdStyle: React.CSSProperties = {
  border: '1px solid #bbb',
  padding: '4px 8px',
  color: '#222',
};
