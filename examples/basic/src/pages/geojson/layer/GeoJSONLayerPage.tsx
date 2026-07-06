import { useCallback, useMemo, useState, useEffect } from 'react';
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

interface SelectedFeature {
  position: GeoPoint;
  properties: Record<string, unknown>;
}

const PROPERTY_LABELS: Record<string, string> = {
  N02_002: '鉄道区分',
  N02_003: '事業者種別',
  N02_004: '路線名',
  N02_005: '運営会社',
};

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
    fetch(`${import.meta.env.BASE_URL}geojson/sample-railway.geojson`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(text => {
        setFeatures(GeoJSONParser.parseFeatures(text));
        setIsLoading(false);
      })
      .catch(err => {
        setError(String(err));
        setIsLoading(false);
      });
  }, []);

  const handleMapClick = useCallback(
    (point: GeoPoint) => {
      if (!layerState.processClick(point)) {
        setSelected(null);
      }
    },
    [layerState],
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
